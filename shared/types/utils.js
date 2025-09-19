Object.defineProperty(exports, '__esModule', { value: true });
exports.getSharedMessage = getSharedMessage;
exports.formatDate = formatDate;
exports.validateEmail = validateEmail;
exports.generateId = generateId;
function getSharedMessage() {
  return 'Aplicação multiplataforma com código compartilhado!';
}
function formatDate(date) {
  return date.toLocaleDateString('pt-BR');
}
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
