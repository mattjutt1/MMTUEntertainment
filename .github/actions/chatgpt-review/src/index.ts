import * as core from '@actions/core'
import * as github from '@actions/github'
import OpenAI from 'openai'

interface EntitlementResponse {
  hasAccess: boolean
  plan: string
  message?: string
}

async function checkEntitlement(installationId: string): Promise<EntitlementResponse> {
  const entitlementsApiUrl = process.env.ENTITLEMENTS_API_URL
  
  if (!entitlementsApiUrl) {
    return { hasAccess: false, plan: 'none', message: 'Entitlements API not configured' }
  }

  try {
    const response = await fetch(`${entitlementsApiUrl}/check/${installationId}`)
    
    if (!response.ok) {
      return { hasAccess: false, plan: 'none', message: 'Failed to check entitlements' }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Entitlement check failed:', error)
    return { hasAccess: false, plan: 'none', message: 'Entitlement check failed' }
  }
}

async function getChatGPTReview(diff: string, openai: OpenAI): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert code reviewer. Analyze the provided git diff and provide a comprehensive review focusing on:
        
        1. Code quality and best practices
        2. Potential bugs or issues
        3. Security vulnerabilities
        4. Performance considerations
        5. Maintainability and readability
        6. Test coverage suggestions
        
        Format your response as a professional code review with specific, actionable feedback.`
      },
      {
        role: "user",
        content: `Please review this pull request diff:\n\n\`\`\`diff\n${diff}\n\`\`\``
      }
    ],
    max_tokens: 2000,
    temperature: 0.3
  })

  return completion.choices[0]?.message?.content || 'Unable to generate review'
}

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github-token')
    const openaiApiKey = core.getInput('openai-api-key')
    const prNumber = parseInt(core.getInput('pr-number'))
    const installationId = process.env.INSTALLATION_ID

    if (!installationId) {
      throw new Error('Installation ID not found')
    }

    // Check entitlements
    const entitlement = await checkEntitlement(installationId)
    
    const octokit = github.getOctokit(githubToken)
    const context = github.context

    if (!entitlement.hasAccess) {
      await octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: prNumber,
        body: `❌ **AI Review Access Required**\n\n${entitlement.message || 'This feature requires an active subscription.'}\n\n[Upgrade to access AI reviews →](https://github.com/marketplace/driftguard-checks)`
      })
      
      core.setFailed('Access denied: No active entitlement')
      return
    }

    // Add processing reaction
    await octokit.rest.reactions.createForIssue({
      ...context.repo,
      issue_number: prNumber,
      content: 'eyes'
    })

    // Get PR diff
    const { data: prData } = await octokit.rest.pulls.get({
      ...context.repo,
      pull_number: prNumber,
      mediaType: {
        format: 'diff'
      }
    })

    // Generate ChatGPT review
    const openai = new OpenAI({ apiKey: openaiApiKey })
    const review = await getChatGPTReview(prData as unknown as string, openai)

    // Post review comment
    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: prNumber,
      body: `## 🤖 AI Code Review (${entitlement.plan})\n\n${review}\n\n---\n*Powered by ChatGPT-4 via DriftGuard • [Learn more](https://github.com/marketplace/driftguard-checks)*`
    })

    // Add success reaction
    await octokit.rest.reactions.createForIssue({
      ...context.repo,
      issue_number: prNumber,
      content: 'rocket'
    })

    core.info('✅ AI review completed successfully')

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    core.setFailed(`Action failed: ${errorMessage}`)
    
    // Try to post error comment if possible
    try {
      const githubToken = core.getInput('github-token')
      const prNumber = parseInt(core.getInput('pr-number'))
      const octokit = github.getOctokit(githubToken)
      const context = github.context

      await octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: prNumber,
        body: `❌ **AI Review Failed**\n\nSorry, the AI review encountered an error. Please try again or contact support.\n\nError: \`${errorMessage}\``
      })
    } catch (commentError) {
      core.error('Failed to post error comment')
    }
  }
}

run()