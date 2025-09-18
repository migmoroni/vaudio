#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::generate_handler;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Olá, {}! Você está usando o Tauri!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("erro ao executar aplicação tauri");
}
