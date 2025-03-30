use std::path::Path;
use config::File;
use serde::Deserialize;
#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub tickets_url: String,
    pub kafka_url: String,
    pub redis_url: String,
    pub topic_name: String,
    pub matches_url: String,
    pub user_url: String,
}

impl Config {
    pub fn from_toml() -> Self {
        dotenv::dotenv().ok();

        let config_url = match dotenv::var("DOCKER").unwrap_or("false".to_string()) == "true" {
            false => "src/configs/dev.toml",
            true => "/app/docker.toml",
        };

        let conf = config::Config::builder()
            .add_source(File::from(Path::new(config_url)))
            .build()
            .expect("Failed to build config");

        let config: Config = conf.try_deserialize::<Config>()
            .expect("Failed to deserialize config");
        config
    }
}
