use crate::orchestrator::config::Config;
use config::Config as RustConfig;
use config::File;
use log::info;
use reqwest::Client;
use std::path::Path;

pub struct Orchestrator {
    pub client: Client, // Клиент reqwest для обращения к другим микросервисам
    pub config: Config, // Конфиг для удобной работы с оркестратором
}

impl Orchestrator {
    pub fn new(config_path: &str) -> Orchestrator {
        let conf = RustConfig::builder()
            .add_source(File::from(Path::new(config_path)))
            .build()
            .expect("Failed to build config");

        let config= conf.try_deserialize::<Config>()
            .expect("Failed to deserialize Orchestrator config");

        info!("Orchestrator config: {:?}", config);
        Orchestrator {
            client: Client::new(),
            config
        }
    }
}