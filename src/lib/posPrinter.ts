// POS Printer Support for DragonBurger
// Handles thermal receipt printing for orders

interface ReceiptData {
  orderNumber: string
  customerName?: string
  items: {
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
  orderType: 'dine_in' | 'takeaway' | 'delivery'
  paymentMethod: string
  timestamp: string
}

interface PrinterConfig {
  width: number
  characterSet: string
  codePage: string
}

// Default printer configuration
const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  width: 48, // Characters per line
  characterSet: 'PC437_USA',
  codePage: 'CP437'
}

/**
 * Check if browser supports printing
 */
export function isPrintingSupported(): boolean {
  return typeof window !== 'undefined' && 'print' in window
}

/**
 * Generate receipt text for thermal printer
 */
export function generateReceiptText(data: ReceiptData): string {
  const { width } = DEFAULT_PRINTER_CONFIG
  let receipt = ''

  // Header
  receipt += centerText('🔥 DRAGONBURGER 🔥', width) + '\n\n'
  receipt += centerText('Premium Restaurant', width) + '\n'
  receipt += centerText('Addis Ababa, Ethiopia', width) + '\n'
  receipt += generateSeparator(width) + '\n\n'

  // Order info
  receipt += `Order #: ${data.orderNumber}\n`
  receipt += `Date: ${data.timestamp}\n`
  receipt += `Type: ${data.orderType.replace('_', ' ').toUpperCase()}\n`
  if (data.customerName) {
    receipt += `Customer: ${data.customerName}\n`
  }
  receipt += generateSeparator(width) + '\n\n'

  // Order items
  receipt += centerText('ORDER DETAILS', width) + '\n'
  receipt += generateSeparator(width) + '\n'
  
  data.items.forEach(item => {
    receipt += `${item.name}\n`
    receipt += `  ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${item.totalPrice.toFixed(2)}\n`
  })
  
  receipt += generateSeparator(width) + '\n\n'

  // Totals
  receipt += `Subtotal: $${data.subtotal.toFixed(2)}\n`
  if (data.tax > 0) {
    receipt += `Tax (15%): $${data.tax.toFixed(2)}\n`
  }
  if (data.deliveryFee > 0) {
    receipt += `Delivery Fee: $${data.deliveryFee.toFixed(2)}\n`
  }
  receipt += generateSeparator(width) + '\n'
  receipt += `TOTAL: $${data.total.toFixed(2)}\n\n`

  // Payment info
  receipt += `Payment: ${data.paymentMethod.toUpperCase()}\n`
  receipt += generateSeparator(width) + '\n\n'

  // Footer
  receipt += centerText('Thank you for your order!', width) + '\n'
  receipt += centerText('Visit us again soon 🐉', width) + '\n\n'
  receipt += centerText('www.dragonburger.et', width) + '\n'
  receipt += centerText('+251 911 123 456', width) + '\n\n\n'

  // QR Code placeholder (in real implementation, generate actual QR code)
  receipt += centerText('[Scan for online receipt]', width) + '\n'
  receipt += centerText('Order #' + data.orderNumber, width) + '\n\n'

  // Cut command for thermal printer
  receipt += '\x1D\x56\x00' // Paper cut command

  return receipt
}

/**
 * Center text within specified width
 */
function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2))
  return ' '.repeat(padding) + text
}

/**
 * Generate separator line
 */
function generateSeparator(width: number): string {
  return '-'.repeat(width)
}

/**
 * Print receipt using browser print API
 */
export async function printReceipt(data: ReceiptData): Promise<void> {
  if (!isPrintingSupported()) {
    throw new Error('Printing is not supported in this browser')
  }

  try {
    const receiptText = generateReceiptText(data)
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    
    if (!printWindow) {
      throw new Error('Failed to open print window')
    }

    // Write receipt content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DragonBurger Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            white-space: pre;
            margin: 20px;
            padding: 20px;
          }
          @media print {
            body {
              margin: 0;
              padding: 10px;
            }
            @page {
              size: 80mm auto;
              margin: 5mm;
            }
          }
          .no-print {
            display: none;
          }
        </style>
      </head>
      <body>
        <pre>${receiptText}</pre>
        <div class="no-print">
          <br><br>
          <button onclick="window.print(); window.close();" style="padding: 10px 20px; background: #ff6b35; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Receipt
          </button>
          <button onclick="window.close();" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `)

    printWindow.document.close()
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Close window after printing (or after user cancels)
        printWindow.onafterprint = () => {
          printWindow.close()
        }
        
        // Fallback close after 3 seconds
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close()
          }
        }, 3000)
      }, 500)
    }

  } catch (error) {
    console.error('Print error:', error)
    throw new Error('Failed to print receipt')
  }
}

/**
 * Generate QR code for order tracking
 */
export function generateOrderQR(orderId: string): string {
  // In a real implementation, use a QR code library
  // For now, return a simple text representation
  const qrData = `https://dragonburger.et/track/${orderId}`
  return `[QR: ${qrData}]`
}

/**
 * Send receipt to thermal printer via Web Bluetooth/USB
 * This requires additional setup and permissions
 */
export async function printToThermalPrinter(data: ReceiptData): Promise<void> {
  try {
    // Request Bluetooth device
    const device = await (navigator as any).bluetooth?.requestDevice({
      acceptAllDevices: true,
      filters: [
        { services: ['printer-service'] }
      ]
    })

    if (!device) {
      throw new Error('No printer selected')
    }

    // Connect to the printer
    const server = await device.gatt?.connect()
    
    if (!server) {
      throw new Error('Failed to connect to printer')
    }

    // Get printer service
    const service = await server.getPrimaryService('printer-service')
    const characteristic = await service.getCharacteristic('printer-characteristic')

    // Convert receipt to bytes and send to printer
    const receiptText = generateReceiptText(data)
    const encoder = new TextEncoder()
    const bytes = encoder.encode(receiptText)
    
    await characteristic.writeValue(bytes)
    
    console.log('Receipt sent to thermal printer')
    
  } catch (error) {
    console.error('Thermal printer error:', error)
    throw new Error('Failed to print to thermal printer')
  }
}

/**
 * Download receipt as text file
 */
export function downloadReceipt(data: ReceiptData): void {
  const receiptText = generateReceiptText(data)
  const blob = new Blob([receiptText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `dragonburger-receipt-${data.orderNumber}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Email receipt (requires backend implementation)
 */
export async function emailReceipt(data: ReceiptData, emailAddress: string): Promise<void> {
  try {
    // In a real implementation, this would call your backend API
    const response = await fetch('/api/email-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailAddress,
        subject: `DragonBurger Receipt - Order #${data.orderNumber}`,
        receipt: generateReceiptText(data)
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send email receipt')
    }

    console.log('Receipt emailed successfully')
  } catch (error) {
    console.error('Email receipt error:', error)
    throw new Error('Failed to email receipt')
  }
}

/**
 * Check if thermal printer is available
 */
export function isThermalPrinterAvailable(): boolean {
  return typeof navigator !== 'undefined' && 
         'bluetooth' in navigator && 
         navigator.bluetooth !== null
}

/**
 * Get available printers
 */
export async function getAvailablePrinters(): Promise<MediaDeviceInfo[]> {
  if (!isPrintingSupported()) {
    return []
  }

  try {
    const devices = await navigator.mediaDevices?.enumerateDevices()
    return devices?.filter(device => 
      (device as any).kind === 'printer' || 
      device.label?.toLowerCase().includes('thermal')
    ) || []
  } catch (error) {
    console.error('Error getting printers:', error)
    return []
  }
}
