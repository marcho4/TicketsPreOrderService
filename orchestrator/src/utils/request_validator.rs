use actix_web::{HttpMessage, HttpRequest, HttpResponse};
use actix_web::http::StatusCode;
use crate::models::jwt_claims::JwtClaims;
use crate::models::roles::Role;
use crate::utils::responses::generic_response;

pub struct RequestValidator;

impl RequestValidator {
    pub fn validate_req(req: &HttpRequest, role: Role, user_id: Option<&str>) -> Result<(), HttpResponse> {
        let binding = Self::check_auth(req)?;

        if binding.role != role {
            return Err(generic_response::<String>(
                StatusCode::FORBIDDEN,
                Some("Access restricted. Wrong role".to_string()),
                None,
            ));
        }

        if let Some(expected_id) = user_id {
            return Self::check_user(req, String::from(expected_id));
        }

        Ok(())
    }

    pub fn check_auth(req: &HttpRequest) -> Result<JwtClaims, HttpResponse> {
        let binding = req.extensions();
        let res = binding.get::<JwtClaims>().ok_or_else(|| {
            generic_response::<String>(
                StatusCode::FORBIDDEN,
                Some("Access restricted. You have to login first.".to_string()),
                None,
            )
        })?;

        Ok(res.clone())
    }

    pub fn get_user_id(req: &HttpRequest) -> Option<String> {
        req.extensions()
            .get::<JwtClaims>()
            .map(|claim| claim.user_id.clone())
    }

    pub fn check_user(req: &HttpRequest, expected_user_id: String) -> Result<(), HttpResponse> {
        let claims = Self::check_auth(req)?;

        if claims.user_id != expected_user_id {
            return Err(generic_response::<String>(
                StatusCode::FORBIDDEN,
                Some("Access restricted. Wrong id".to_string()),
                None,
            ));
        }

        Ok(())
    }
}