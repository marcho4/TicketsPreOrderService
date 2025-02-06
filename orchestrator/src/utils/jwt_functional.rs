use crate::models::jwt_claims::JwtClaims;
use crate::orchestrator::orchestrator::Orchestrator;
use crate::utils::errors::OrchestratorError;

impl Orchestrator {
    pub async fn decode_jwt() -> Result<JwtClaims, OrchestratorError> {
        unimplemented!()
    }
    pub async fn generate_jwt() -> Result<JwtClaims, OrchestratorError> {
        unimplemented!()
    }
}