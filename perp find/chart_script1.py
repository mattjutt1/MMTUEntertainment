import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json

# Load the pricing data
pricing_data = {
    "pricing": [
        {"tool": "CodeClimate Quality", "category": "Code Analysis Tools", "price_per_dev": 16.67, "source": "Verified buyer data"},
        {"tool": "CodeClimate Velocity", "category": "Code Analysis Tools", "price_per_dev": 37.42, "source": "Verified buyer data"},
        {"tool": "GitHub Teams", "category": "Platform", "price_per_dev": 4, "source": "GitHub official"},
        {"tool": "GitHub Enterprise", "category": "Platform", "price_per_dev": 21, "source": "GitHub official"},
        {"tool": "DriftGuard Starter", "category": "DriftGuard (Proposed)", "price_per_dev": 5, "source": "Strategic positioning"},
        {"tool": "DriftGuard Pro", "category": "DriftGuard (Proposed)", "price_per_dev": 15, "source": "Strategic positioning"},
        {"tool": "DriftGuard Enterprise", "category": "DriftGuard (Proposed)", "price_per_dev": 25, "source": "Strategic positioning"}
    ]
}

# Convert to DataFrame
df = pd.DataFrame(pricing_data["pricing"])

# Define brand colors
colors = ['#1FB8CD', '#DB4545', '#2E8B57', '#5D878F', '#D2BA4C', '#B4413C', '#964325']

# Create the grouped bar chart
fig = go.Figure()

# Get unique categories
categories = df['category'].unique()

# Add bars for each category
for i, category in enumerate(categories):
    category_data = df[df['category'] == category]
    
    fig.add_trace(go.Bar(
        name=category,
        x=category_data['tool'],
        y=category_data['price_per_dev'],
        marker_color=colors[i % len(colors)],
        hovertemplate='<b>%{x}</b><br>Price: $%{y}/dev/mo<extra></extra>',
        cliponaxis=False
    ))

# Update layout
fig.update_layout(
    title='Dev Tool Pricing Analysis',
    xaxis_title='Tools',
    yaxis_title='Price ($/dev/mo)',
    barmode='group',
    legend=dict(
        orientation='h', 
        yanchor='bottom', 
        y=1.05, 
        xanchor='center', 
        x=0.5
    )
)

# Update axes
fig.update_xaxes(tickangle=45)
fig.update_yaxes()

# Save the chart
fig.write_image('competitive_pricing_analysis.png')