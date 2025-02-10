use serde::{ Serialize, Deserialize };
use chrono::{DateTime, Utc};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Match {
    pub id: String,
    pub organizer_id: String,
    pub match_description: String,
    pub team_home: String,
    pub team_away: String,
    pub stadium: String,
    pub match_status: u8,
    pub match_date_time: DateTime<Utc>,
}


#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateMatchData {
    pub team_home: String,
    pub team_away: String,
    pub match_date_time: DateTime<Utc>,
    pub stadium: String,
    pub match_description: String
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMatchData {
    pub match_description: String,
    pub stadium: String,
    pub match_date_time: DateTime<Utc>,
}
#[derive(Deserialize, ToSchema)]
pub struct Empty {}