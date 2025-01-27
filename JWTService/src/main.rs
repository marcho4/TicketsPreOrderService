mod api;
mod models;

use dotenv::dotenv;
use crate::api::jwt_api::*;
use rocket::{launch, routes, build};
use rocket::config::Config;


#[launch]
pub fn rocket() -> _ {
    dotenv().ok();

    let my_config = Config {
        port: 8001,
        address: "0.0.0.0".parse().unwrap(),
        keep_alive: 75,
        ..Config::default()
    };
    build().configure(my_config)
        .mount("/", routes![generate_jwt])
        .mount("/", routes![verify_jwt])
}