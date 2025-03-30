use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct QueueModel {
    pub user_id: String,
    pub min_price: i64,
    pub max_price: i64,
    pub email: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct QueueAdd {
    pub min_price: i64,
    pub max_price: i64,
}

