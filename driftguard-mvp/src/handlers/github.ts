/**
 * GitHub Webhook Handler
 * Processes GitHub App events and installation management
 */

import type { Env } from '../index';
import { jsonResponse, errorResponse } from '../utils/response';
import { verifyGitHubWebhookSignature, parseGitHubWebhookEvent, extractRepositoryInfo } from '../utils/github';

export async function handleGitHubWebhook(
  request: Request,
  env: Env,
  services: { supabase: any; posthog: any }
): Promise<Response> {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // Verify webhook signature
    if (env.ENVIRONMENT === 'production') {
      const isValid = await verifyGitHubWebhookSignature(payload, signature, env.GITHUB_WEBHOOK_SECRET || '');
      if (!isValid) {
        return errorResponse('Invalid webhook signature', 401);
      }
    }

    const { event, delivery } = parseGitHubWebhookEvent(request.headers);
    if (!event || !delivery) {
      return errorResponse('Missing GitHub webhook headers', 400);
    }

    const webhookData = JSON.parse(payload);
    const repositoryInfo = extractRepositoryInfo(webhookData);

    // Handle different webhook events
    switch (event) {
      case 'installation':
        return await handleInstallationEvent(webhookData, env, services);

      case 'installation_repositories':
        return await handleInstallationRepositoriesEvent(webhookData, env, services);

      case 'check_run':
        return await handleCheckRunEvent(webhookData, env, services);

      case 'check_suite':
        return await handleCheckSuiteEvent(webhookData, env, services);

      case 'push':
        return await handlePushEvent(webhookData, env, services);

      case 'pull_request':
        return await handlePullRequestEvent(webhookData, env, services);

      default:
        // Log unknown events for monitoring
        services.posthog.capture({
          distinctId: 'system',
          event: 'github_webhook_unknown',
          properties: {
            event_type: event,
            repository: repositoryInfo ? `${repositoryInfo.owner}/${repositoryInfo.repo}` : 'unknown',
            delivery_id: delivery,
          },
        });

        return jsonResponse({ message: 'Event received but not processed', event });
    }

  } catch (error) {
    console.error('GitHub webhook error:', error);
    
    services.posthog.capture({
      distinctId: 'system',
      event: 'github_webhook_error',
      properties: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    });

    return errorResponse('Failed to process webhook', 500);
  }
}

/**
 * Handle GitHub App installation events
 */
async function handleInstallationEvent(
  payload: any,
  env: Env,
  services: { supabase: any; posthog: any }
): Promise<Response> {
  const { action, installation, sender } = payload;

  if (action === 'created') {
    // New installation - create user/organization record
    await services.supabase
      .from('installations')
      .insert({
        github_installation_id: installation.id,
        account_type: installation.account.type,
        account_login: installation.account.login,
        account_id: installation.account.id,
        permissions: installation.permissions,
        repository_selection: installation.repository_selection,
        installed_by: sender.login,
        installed_at: new Date().toISOString(),
      });

    services.posthog.capture({
      distinctId: installation.account.login,
      event: 'github_app_installed',
      properties: {
        installation_id: installation.id,
        account_type: installation.account.type,
        account_login: installation.account.login,
        repository_selection: installation.repository_selection,
        installed_by: sender.login,
      },
    });

  } else if (action === 'deleted') {
    // Installation removed - mark as deleted
    await services.supabase
      .from('installations')
      .update({ 
        deleted_at: new Date().toISOString(),
        deleted_by: sender.login,
      })
      .eq('github_installation_id', installation.id);

    services.posthog.capture({
      distinctId: installation.account.login,
      event: 'github_app_uninstalled',
      properties: {
        installation_id: installation.id,
        account_login: installation.account.login,
        deleted_by: sender.login,
      },
    });
  }

  return jsonResponse({ message: 'Installation event processed', action });
}

/**
 * Handle repository selection changes
 */
async function handleInstallationRepositoriesEvent(
  payload: any,
  env: Env,
  services: { supabase: any; posthog: any }
): Promise<Response> {
  const { action, installation, repositories_added, repositories_removed } = payload;

  if (action === 'added' && repositories_added) {
    for (const repo of repositories_added) {
      await services.supabase
        .from('installation_repositories')
        .insert({
          github_installation_id: installation.id,
          repository_id: repo.id,
          repository_name: repo.name,
          repository_full_name: repo.full_name,
          private: repo.private,
          added_at: new Date().toISOString(),
        });
    }

    services.posthog.capture({
      distinctId: installation.account.login,
      event: 'repositories_added',
      properties: {
        installation_id: installation.id,
        repositories_count: repositories_added.length,
        repository_names: repositories_added.map((r: any) => r.name),
      },
    });
  }

  if (action === 'removed' && repositories_removed) {
    for (const repo of repositories_removed) {
      await services.supabase
        .from('installation_repositories')
        .update({ removed_at: new Date().toISOString() })
        .eq('github_installation_id', installation.id)
        .eq('repository_id', repo.id);
    }

    services.posthog.capture({
      distinctId: installation.account.login,
      event: 'repositories_removed',
      properties: {
        installation_id: installation.id,
        repositories_count: repositories_removed.length,
        repository_names: repositories_removed.map((r: any) => r.name),
      },
    });
  }

  return jsonResponse({ message: 'Repository selection updated', action });
}

/**
 * Handle check run events (for monitoring our own check runs)
 */
async function handleCheckRunEvent(
  payload: any,
  env: Env,
  services: { supabase: any; posthog: any }
): Promise<Response> {
  const { action, check_run, repository } = payload;

  // Only track check runs created by our app
  if (check_run.app.id.toString() !== env.GITHUB_APP_ID) {
    return jsonResponse({ message: 'Check run not from this app' });
  }

  if (action === 'completed') {
    await services.supabase
      .from('check_runs')
      .update({
        status: check_run.status,
        conclusion: check_run.conclusion,
        completed_at: check_run.completed_at,
      })
      .eq('github_check_run_id', check_run.id);

    services.posthog.capture({
      distinctId: `${repository.owner.login}/${repository.name}`,
      event: 'check_run_completed',
      properties: {
        check_run_id: check_run.id,
        check_run_name: check_run.name,
        status: check_run.status,
        conclusion: check_run.conclusion,
        repository: repository.full_name,
      },
    });
  }

  return jsonResponse({ message: 'Check run event processed', action });
}

/**
 * Handle check suite events
 */
async function handleCheckSuiteEvent(
  payload: any,
  env: Env,
  services: { supabase: any; posthog: any }
): Promise<Response> {
  const { action, check_suite, repository } = payload;

  // Track check suite completion for analytics
  if (action === 'completed') {
    services.posthog.capture({
      distinctId: `${repository.owner.login}/${repository.name}`,
      event: 'check_suite_completed',
      properties: {
        check_suite_id: check_suite.id,
        status: check_suite.status,
        conclusion: check_suite.conclusion,
        repository: repository.full_name,
        head_branch: check_suite.head_branch,
        head_sha: check_suite.head_sha,
      },
    });
  }

  return jsonResponse({ message: 'Check suite event processed', action });
}

/**
 * Handle push events (for potential automated check triggering)
 */
async function handlePushEvent(
  payload: any,
  env: Env,
  services: { supabase: any; posthog: any }
): Promise<Response> {
  const { repository, commits, pusher } = payload;

  services.posthog.capture({
    distinctId: `${repository.owner.login}/${repository.name}`,
    event: 'repository_push',
    properties: {
      repository: repository.full_name,
      branch: payload.ref.replace('refs/heads/', ''),
      commits_count: commits.length,
      pusher: pusher.name,
    },
  });

  return jsonResponse({ message: 'Push event tracked' });
}

/**
 * Handle pull request events
 */
async function handlePullRequestEvent(
  payload: any,
  env: Env,
  services: { supabase: any; posthog: any }
): Promise<Response> {
  const { action, pull_request, repository } = payload;

  if (['opened', 'synchronize', 'reopened'].includes(action)) {
    services.posthog.capture({
      distinctId: `${repository.owner.login}/${repository.name}`,
      event: 'pull_request_updated',
      properties: {
        action,
        pr_number: pull_request.number,
        repository: repository.full_name,
        head_sha: pull_request.head.sha,
        base_branch: pull_request.base.ref,
        head_branch: pull_request.head.ref,
      },
    });
  }

  return jsonResponse({ message: 'Pull request event tracked', action });
}