import plotly.graph_objects as go
import plotly.io as pio

# Data from the provided JSON
data = {
    "markets": [
        {"segment": "Global Continuous Delivery Market", "2024": 4.27, "2034": 17.80, "cagr": "15.35%"},
        {"segment": "US Continuous Delivery Market", "2024": 1.14, "2034": 4.83, "cagr": "15.53%"}
    ]
}

# Extract data for plotting
segments = [market["segment"] for market in data["markets"]]
values_2024 = [market["2024"] for market in data["markets"]]
values_2034 = [market["2034"] for market in data["markets"]]
cagr_rates = [market["cagr"] for market in data["markets"]]

# Shorten segment names for display
short_segments = ["Global Market", "US Market"]

# Create the bar chart
fig = go.Figure()

# Add 2024 bars
fig.add_trace(go.Bar(
    name='2024',
    x=short_segments,
    y=values_2024,
    text=[f'${val}b' for val in values_2024],
    textposition='auto',
    marker_color='#1FB8CD',
    hovertemplate='<b>%{x}</b><br>2024: $%{y}b<br>CAGR: ' + cagr_rates[0] + '<extra></extra>',
    cliponaxis=False
))

# Add 2034 bars  
fig.add_trace(go.Bar(
    name='2034',
    x=short_segments,
    y=values_2034,
    text=[f'${val}b' for val in values_2034],
    textposition='auto',
    marker_color='#DB4545',
    hovertemplate='<b>%{x}</b><br>2034: $%{y}b<br>CAGR: ' + cagr_rates[0] + '<extra></extra>',
    cliponaxis=False
))

# Update hover templates with correct CAGR rates for each market
fig.data[0].hovertemplate = ['<b>Global Market</b><br>2024: $%{y}b<br>CAGR: 15.35%<extra></extra>',
                            '<b>US Market</b><br>2024: $%{y}b<br>CAGR: 15.53%<extra></extra>']
fig.data[1].hovertemplate = ['<b>Global Market</b><br>2034: $%{y}b<br>CAGR: 15.35%<extra></extra>',
                            '<b>US Market</b><br>2034: $%{y}b<br>CAGR: 15.53%<extra></extra>']

# Update layout
fig.update_layout(
    title='Continuous Delivery Market Projections',
    xaxis_title='Market Segment',
    yaxis_title='Size (Billions)',
    barmode='group',
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)

# Save the chart
fig.write_image('market_projections.png')