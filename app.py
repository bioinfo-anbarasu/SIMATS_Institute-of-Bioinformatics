import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from scipy.cluster.hierarchy import linkage, dendrogram
import numpy as np

# Page Configuration
st.set_page_config(page_title="BioinfoPlot - Academic Visualization", layout="wide")

# Sidebar Navigation
st.sidebar.title("🧬 BioinfoPlot")
plot_type = st.sidebar.radio("Select Plot Type", 
    ["2D Pie Plot", "Gene Up-Down Bar Plot", "Cluster Heatmap", "GO Enrichment Bar Plot", "3D PCA Scatter Plot"])

st.sidebar.markdown("---")
st.sidebar.info("Upload your CSV/TSV file to generate publication-quality plots.")

# --- Helper Functions ---
def load_data():
    uploaded_file = st.file_uploader("Upload CSV or TSV file", type=["csv", "tsv"])
    if uploaded_file:
        sep = "," if uploaded_file.name.endswith(".csv") else "\t"
        return pd.read_csv(uploaded_file, sep=sep)
    return None

# --- Plot Logic ---
st.title(f"📊 {plot_type}")

data = load_data()

if data is not None:
    # 1. 2D PIE PLOT
    if plot_type == "2D Pie Plot":
        col1, col2 = st.columns([1, 3])
        with col1:
            cat_col = st.selectbox("Category Column", data.columns)
            val_col = st.selectbox("Value Column", data.columns)
            show_labels = st.checkbox("Show Labels", value=True)
        
        fig = px.pie(data, names=cat_col, values=val_col, template="plotly_white")
        fig.update_traces(textinfo='percent+label' if show_labels else 'none')
        st.plotly_chart(fig, use_container_width=True)

    # 2. GENE UP-DOWN BAR PLOT
    elif plot_type == "Gene Up-Down Bar Plot":
        gene_col = st.selectbox("Gene Name Column", data.columns)
        fc_col = st.selectbox("log2FoldChange Column", data.columns)
        
        data['color'] = ['#FF4B4B' if x > 0 else '#23C552' for x in data[fc_col]]
        data = data.sort_values(by=fc_col, key=abs, ascending=False)
        
        fig = px.bar(data, x=gene_col, y=fc_col, color='color', 
                     color_discrete_map="identity", template="plotly_white")
        fig.add_hline(y=0, line_dash="solid", line_color="black")
        st.plotly_chart(fig, use_container_width=True)

    # 3. CLUSTER HEATMAP
    elif plot_type == "Cluster Heatmap":
        st.warning("Ensure rows are genes and columns are samples.")
        df_numeric = data.set_index(data.columns[0]).select_dtypes(include=[np.number])
        
        z_score = st.toggle("Apply Z-Score Normalization")
        if z_score:
            df_numeric = df_numeric.apply(lambda x: (x - x.mean()) / x.std(), axis=1)
            
        fig = px.imshow(df_numeric, color_continuous_scale='RdBu_r', aspect="auto")
        st.plotly_chart(fig, use_container_width=True)

    # 4. GO ENRICHMENT BAR PLOT
    elif plot_type == "GO Enrichment Bar Plot":
        term_col = st.selectbox("Term Column", data.columns)
        cat_col = st.selectbox("Category (BP/CC/MF)", data.columns)
        count_col = st.selectbox("Gene Count", data.columns)
        
        data = data.sort_values(by=count_col, ascending=False)
        fig = px.bar(data, x=count_col, y=term_col, color=cat_col, 
                     orientation='h', template="plotly_white")
        st.plotly_chart(fig, use_container_width=True)

    # 5. 3D PCA SCATTER PLOT
    elif plot_type == "3D PCA Scatter Plot":
        x = st.selectbox("X Axis", data.columns)
        y = st.selectbox("Y Axis", data.columns)
        z = st.selectbox("Z Axis", data.columns)
        label = st.selectbox("Label Column", data.columns)
        
        fig = px.scatter_3d(data, x=x, y=y, z=z, text=label, template="plotly_white")
        st.plotly_chart(fig, use_container_width=True)

else:
    st.info("Please upload a dataset to begin. The file should have columns relevant to the selected plot type.")