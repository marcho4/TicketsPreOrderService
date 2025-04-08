use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};

pub fn generate_random_email() -> String {
    let mut rng = thread_rng();
    let username: String = (0..10)
        .map(|_| rng.sample(Alphanumeric) as char)
        .collect();
    let domain = "example.com";
    format!("{}@{}", username, domain)
}