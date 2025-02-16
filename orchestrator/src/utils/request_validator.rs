use actix_web::{HttpMessage, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::jwt_claims::JwtClaims;
use crate::models::roles::Role;
use crate::utils::responses::generic_response;

pub struct RequestValidator;

impl RequestValidator {
    pub fn validate_req(req: &HttpRequest, role: Role, user_id: Option<&str>) -> Result<(), HttpResponse> {
        let binding = req.extensions();
        let jwt_claims = binding.get::<JwtClaims>().ok_or_else(|| {
            generic_response::<String>(
                StatusCode::FORBIDDEN,
                Some("Access restricted. You have to login first.".to_string()),
                None,
            )
        })?;

        if jwt_claims.role != role {
            return Err(generic_response::<String>(
                StatusCode::FORBIDDEN,
                Some("Access restricted. Wrong role".to_string()),
                None,
            ));
        }

        if let Some(expected_id) = user_id {
            if jwt_claims.user_id != expected_id {
                return Err(generic_response::<String>(
                    StatusCode::FORBIDDEN,
                    Some("Access restricted. Wrong id".to_string()),
                    None,
                ));
            }
        }

        Ok(())
    }
}