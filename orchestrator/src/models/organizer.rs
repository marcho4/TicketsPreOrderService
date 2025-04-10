use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use crate::models::general::Role;

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct CreateOrgData {
    pub tin: String,
    pub email: String,
    pub organization_name: String,
    pub phone_number: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct OrgApproveData {
    pub(crate) email: String,
    pub(crate) company: String,
    pub(crate) tin: String,
    pub(crate) status: String,
    pub(crate) user_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct OrgApproveResponse {
    pub login: String,
    pub password: String,
    pub message: String,
    pub status: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct OrgCreationResponse {
    pub message: String,
    pub status: String,
    pub data: OrgId,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct OrgId {
    pub id: String,
    pub role: Role
}

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize, ToSchema)]
pub struct OrganizerInfo {
    pub phone_number: String,
    pub email: String,
    pub tin: String,
    pub organization_name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct OrganizerRegistrationData {
    pub company: String,
    pub email: String,
    pub tin: String,
    pub phone_number: String,
}

#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize, ToSchema)]
pub struct RegistrationErrorOrg {
    pub status: String,
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, ToSchema)]
pub struct RegistrationOrgResp {
    status: String,
}