use std::future::{ready, Future, Ready};
use std::pin::Pin;
use std::sync::Arc;
use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::{Error, HttpMessage};
use chrono::Utc;
use jsonwebtoken::DecodingKey;
use log::info;
use crate::models::jwt_claims::JwtClaims;

#[derive(Clone)]
pub struct AuthMiddleware {
    pub(crate) jwt_secret: Arc<String>,
}

// Middleware factory is implemented using the `Transform` trait
// `S` - type of the next service
// `B` - type of response's body
impl<S, B> Transform<S, ServiceRequest> for AuthMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    // Define associated types for the middleware
    type Response = ServiceResponse<B>; // Type of the response
    type Error = Error; // Type of error
    type Transform = MyAuthMiddleware<S>; // Type representing the transformed middleware
    type InitError = (); // Type of initialization error
    type Future = Ready<Result<Self::Transform, Self::InitError>>; // Type of the future returned by initialization

    // Initialize the middleware
    fn new_transform(&self, service: S) -> Self::Future {
        // Return a Ready future containing the MyAuditDataMiddleware instance
        ready(Ok(
            MyAuthMiddleware {
                service,
                key: Arc::new(DecodingKey::from_secret(self.jwt_secret.as_bytes()))
            }
        ))
    }
}

// Struct representing the middleware
pub struct MyAuthMiddleware<S> {
    /// The next service to call after this one
    service: S,
    key: Arc<DecodingKey>
}

impl<S, B> Service<ServiceRequest> for MyAuthMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    actix_web::dev::forward_ready!(service);
    fn call(&self, req: ServiceRequest) -> Self::Future {
        let jwt = req.request().cookie("token");

        if let Some(jwt) = jwt {
            let jwt_token = jwt.value();

            let decoded = jsonwebtoken::decode::<JwtClaims>(
                jwt_token,
                &(self.key),
                &Default::default()
            );

            if let Ok(decoded) = decoded {
                if !(decoded.claims.exp < Utc::now().timestamp() as u64) {
                    info!("Successfully decoded token in the middleware for user: {:?}", decoded.claims.user_id);
                    req.extensions_mut().insert(decoded.claims);
                } else {
                    info!("JWT token expired");
                }
            };
        }


        let future = self.service.call(req);

        Box::pin(async move {
            let res = match future.await {
                Ok(response) => response,
                Err(error) => panic!("Unable to process middleware: {}", error),
            };
            Ok(res)
        })
    }
}