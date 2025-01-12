mod api;
mod models;

use crate::api::jwt_api::*;
use rocket::{launch, routes, build};
use rocket::config::Config;


#[launch]
pub fn rocket() -> _ {
    let my_config = Config {
        port: 8002,
        address: "0.0.0.0".parse().unwrap(),
        ..Config::default()
    };
    build().configure(my_config)
        .mount("/", routes![generate_jwt])
        .mount("/", routes![verify_jwt])
}