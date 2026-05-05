
export const getWhatsAppLink = (message: string) => {
  const phone = (import.meta as any).env.VITE_WHATSAPP_PHONE || '+390123456789';
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone.replace('+', '')}?text=${encodedMessage}`;
};

export const formatOrderMessage = (orderId: string, items: any[], total: number, customer: any) => {
  const typeLabels: Record<string, string> = {
    takeaway: '🥡 Ritiro sul posto (Asporto)',
    table: '🍽️ Consumazione al Tavolo',
    delivery: '🛵 Consegna a Domicilio (Napoli)'
  };

  let message = `*Nuovo Ordine La Lazzara*\n`;
  message += `ID: #${orderId.slice(-6).toUpperCase()}\n`;
  message += `Tipo: ${typeLabels[customer.orderType] || customer.orderType}\n`;
  message += `Cliente: ${customer.name}\n`;
  if (customer.orderType === 'delivery') message += `Indirizzo: ${customer.address}\n`;
  message += `\n*Dettagli:*\n`;
  items.forEach(item => {
    message += `- ${item.quantity}x ${item.name} (€${(item.price * item.quantity).toFixed(2)})\n`;
  });
  message += `\n*Totale: €${total.toFixed(2)}*\n\n`;
  message += `_Attendo conferma ricezione._`;
  return message;
};

export const formatReservationMessage = (data: any) => {
  let message = `*Nuova Prenotazione Tavolo*\n`;
  message += `Nome: ${data.name}\n`;
  message += `Ospiti: ${data.guests}\n`;
  message += `Data: ${data.date}\n`;
  message += `Ora: ${data.time}\n`;
  if (data.occasion) message += `Occasione: ${data.occasion}\n`;
  if (data.specialRequest) message += `Richieste: ${data.specialRequest}\n`;
  message += `\n_Si prega di confermare la disponibilità._`;
  return message;
};

export const formatProductInquiryMessage = (product: any) => {
  return `Ciao! Vorrei avere più informazioni su: *${product.name}* (€${product.price.toFixed(2)}).`;
};
