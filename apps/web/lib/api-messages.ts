export const apiMessages = {
  es: {
    unauthorized: 'No autorizado',
    missing_fields: 'Faltan campos requeridos',
    server_error: 'Error interno del servidor',
    not_found: 'No encontrado',
    created: 'Creado correctamente',
    updated: 'Actualizado correctamente',
    deleted: 'Eliminado correctamente',
    invalid_credentials: 'Credenciales inválidas',
    config_error: 'Error de configuración del servidor',
    user_not_found: 'Usuario no encontrado',
    payment_success: 'Pago registrado correctamente',
    invoice_generated: 'Factura generada correctamente',
    invoices_generated: 'Facturas generadas correctamente',
    already_exists: 'Ya existe un registro con estos datos',
  },
  en: {
    unauthorized: 'Unauthorized',
    missing_fields: 'Missing required fields',
    server_error: 'Internal server error',
    not_found: 'Not found',
    created: 'Created successfully',
    updated: 'Updated successfully',
    deleted: 'Deleted successfully',
    invalid_credentials: 'Invalid credentials',
    config_error: 'Server configuration error',
    user_not_found: 'User not found',
    payment_success: 'Payment registered successfully',
    invoice_generated: 'Invoice generated successfully',
    invoices_generated: 'Invoices generated successfully',
    already_exists: 'A record with this data already exists',
  },
  pt: {
    unauthorized: 'Não autorizado',
    missing_fields: 'Campos obrigatórios ausentes',
    server_error: 'Erro interno do servidor',
    not_found: 'Não encontrado',
    created: 'Criado com sucesso',
    updated: 'Atualizado com sucesso',
    deleted: 'Eliminado com sucesso',
    invalid_credentials: 'Credenciais inválidas',
    config_error: 'Erro de configuração do servidor',
    user_not_found: 'Usuário não encontrado',
    payment_success: 'Pagamento registrado com sucesso',
    invoice_generated: 'Fatura gerada com sucesso',
    invoices_generated: 'Faturas geradas com sucesso',
    already_exists: 'Já existe um registro com estes dados',
  },
};

export function getApiMessage(locale: string, key: keyof typeof apiMessages.es): string {
  const lang = (locale || 'es').substring(0, 2);
  const messages = apiMessages[lang as keyof typeof apiMessages] || apiMessages.es;
  return messages[key] || apiMessages.es[key];
}