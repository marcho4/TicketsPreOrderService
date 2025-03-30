#[derive(Debug, thiserror::Error)]
pub enum OrchestratorError {
    #[error("Http request failed: {0}")]
    Request(#[from] reqwest::Error),

    #[error("Serde error: {0}")]
    Deserialize(#[from] serde_json::Error),

    #[error("Service returned an error: {0}")]
    Service(String),
}