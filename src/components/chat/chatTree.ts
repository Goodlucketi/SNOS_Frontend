export type NodeType = 'standard' | 'whatsapp';

export interface ChatOption {
  label: string;
  nextNodeId: string;
}

export interface ChatNode {
  id: string;
  message: string;
  options?: ChatOption[];
  type: NodeType;
}

export const chatTree: Record<string, ChatNode> = {
  // ---------------------------------------------------------
  // ROOT NODE
  // ---------------------------------------------------------
  root: {
    id: 'root',
    type: 'standard',
    message: "Hello! I'm the SNOS Virtual Assistant. How can I help you secure your world today?",
    options: [
      { label: "Hardware & Setup Support", nextNodeId: "hardware_root" },
      { label: "Network & Connectivity", nextNodeId: "network_root" },
      { label: "Billing & Account Management", nextNodeId: "billing_root" },
      { label: "Emergency & False Alarms", nextNodeId: "emergency_root" },
      { label: "Sales & Upgrades", nextNodeId: "sales_root" },
      { label: "Speak to a Human / WhatsApp", nextNodeId: "whatsapp_handoff" }
    ]
  },

  // ---------------------------------------------------------
  // HARDWARE & SETUP
  // ---------------------------------------------------------
  hardware_root: {
    id: 'hardware_root',
    type: 'standard',
    message: "Which device are you setting up or troubleshooting?",
    options: [
      { label: "Main Gateway Hub", nextNodeId: "hw_hub" },
      { label: "Door & Window Sensors", nextNodeId: "hw_sensors" },
      { label: "Outdoor Cameras", nextNodeId: "hw_cameras" },
      { label: "Smart Sirens", nextNodeId: "hw_sirens" },
      { label: "Go Back", nextNodeId: "root" }
    ]
  },
  hw_hub: {
    id: 'hw_hub',
    type: 'standard',
    message: "The Main Gateway Hub is the brain of your SNOS system. What do you need help with?",
    options: [
      { label: "Initial Pairing", nextNodeId: "hw_hub_pairing" },
      { label: "Factory Reset", nextNodeId: "hw_hub_reset" },
      { label: "Battery Backup Issues", nextNodeId: "hw_hub_battery" },
      { label: "Speak to a Technician (WhatsApp)", nextNodeId: "whatsapp_handoff" },
      { label: "Go Back", nextNodeId: "hardware_root" }
    ]
  },
  hw_hub_pairing: {
    id: 'hw_hub_pairing',
    type: 'standard',
    message: "To pair your Hub, ensure it's plugged directly into your router via Ethernet for the first setup. Once the LED is solid blue, scan the QR code on the bottom using the SNOS app. Did this resolve the issue?",
    options: [
      { label: "Yes, it worked!", nextNodeId: "resolved" },
      { label: "No, the LED is red", nextNodeId: "hw_hub_red_led" },
      { label: "I need human help", nextNodeId: "whatsapp_handoff" }
    ]
  },
  hw_hub_red_led: {
    id: 'hw_hub_red_led',
    type: 'standard',
    message: "A red LED indicates no internet connection. Please check your Ethernet cable and ensure your ISP is currently active. If it persists, reboot your modem.",
    options: [
      { label: "Main Menu", nextNodeId: "root" },
      { label: "Contact Support (WhatsApp)", nextNodeId: "whatsapp_handoff" }
    ]
  },
  hw_hub_reset: {
    id: 'hw_hub_reset',
    type: 'standard',
    message: "To factory reset: Locate the recessed button on the back. Use a paperclip to hold it for 10 seconds until it flashes amber. ALL paired devices will be erased.",
    options: [
      { label: "Understood, thanks", nextNodeId: "resolved" },
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },
  hw_hub_battery: {
    id: 'hw_hub_battery',
    type: 'standard',
    message: "The internal battery lasts 24 hours. If your hub dies immediately when unplugged, the battery may need replacement. Is your hub older than 3 years?",
    options: [
      { label: "Yes, it is older", nextNodeId: "hw_hub_replace_battery" },
      { label: "No, it's new", nextNodeId: "whatsapp_handoff" }
    ]
  },
  hw_hub_replace_battery: {
    id: 'hw_hub_replace_battery',
    type: 'standard',
    message: "Batteries naturally degrade over 3 years. We can ship you a replacement battery cartridge for $29, or you can upgrade your Hub.",
    options: [
      { label: "Order Battery (WhatsApp)", nextNodeId: "whatsapp_handoff" },
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },
  hw_sensors: {
    id: 'hw_sensors',
    type: 'standard',
    message: "Door & Window sensors rely on magnetic contacts. What seems to be the problem?",
    options: [
      { label: "Always shows 'Open'", nextNodeId: "hw_sensors_open" },
      { label: "Keeps falling off", nextNodeId: "hw_sensors_mount" },
      { label: "Low Battery Warning", nextNodeId: "hw_sensors_battery" },
      { label: "Go Back", nextNodeId: "hardware_root" }
    ]
  },
  hw_sensors_open: {
    id: 'hw_sensors_open',
    type: 'standard',
    message: "If a closed door shows 'Open', the gap between the sensor and magnet is likely greater than 0.5 inches. Please remount them closer together.",
    options: [
      { label: "Fixed it!", nextNodeId: "resolved" },
      { label: "They are touching, still broken", nextNodeId: "whatsapp_handoff" }
    ]
  },
  hw_sensors_mount: {
    id: 'hw_sensors_mount',
    type: 'standard',
    message: "For humid areas or porous wood, the adhesive pads might fail. We recommend using the provided micro-screws for a permanent mount.",
    options: [
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },
  hw_sensors_battery: {
    id: 'hw_sensors_battery',
    type: 'standard',
    message: "Contact sensors use standard CR2032 coin batteries. Slide the cover up to replace it. Be sure the '+' side faces you.",
    options: [
      { label: "Thanks", nextNodeId: "resolved" }
    ]
  },
  hw_cameras: {
    id: 'hw_cameras',
    type: 'standard',
    message: "Outdoor Cameras provide your perimeter defense. What is your issue?",
    options: [
      { label: "Poor Video Quality/Blurry", nextNodeId: "hw_cameras_quality" },
      { label: "Motion Detection too sensitive", nextNodeId: "hw_cameras_motion" },
      { label: "Night Vision not working", nextNodeId: "hw_cameras_night" },
      { label: "Go Back", nextNodeId: "hardware_root" }
    ]
  },
  hw_cameras_quality: {
    id: 'hw_cameras_quality',
    type: 'standard',
    message: "Blurry video is usually caused by a dirty lens or a weak Wi-Fi signal dropping the resolution. Please wipe the lens with a microfiber cloth and check the signal in the app.",
    options: [
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },
  hw_cameras_motion: {
    id: 'hw_cameras_motion',
    type: 'standard',
    message: "You can adjust the 'Activity Zones' in the app to ignore trees blowing in the wind. Also, lower the 'Motion Sensitivity' slider from High to Medium.",
    options: [
      { label: "Fixed it!", nextNodeId: "resolved" },
      { label: "Need human help", nextNodeId: "whatsapp_handoff" }
    ]
  },
  hw_cameras_night: {
    id: 'hw_cameras_night',
    type: 'standard',
    message: "If infrared (IR) night vision isn't triggering, ensure there isn't a bright streetlamp shining directly into the camera lens, which fools the ambient light sensor.",
    options: [
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },
  hw_sirens: {
    id: 'hw_sirens',
    type: 'standard',
    message: "The 105dB Smart Siren is designed to deter intruders. Are you trying to change the volume or disable the entry chimes?",
    options: [
      { label: "Change Volume", nextNodeId: "hw_sirens_vol" },
      { label: "Disable Chimes", nextNodeId: "hw_sirens_chime" },
      { label: "Go Back", nextNodeId: "hardware_root" }
    ]
  },
  hw_sirens_vol: {
    id: 'hw_sirens_vol',
    type: 'standard',
    message: "The alarm volume cannot be lowered for regulatory reasons, but you can lower the countdown/chime volume in Settings > Devices > Smart Siren.",
    options: [
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },
  hw_sirens_chime: {
    id: 'hw_sirens_chime',
    type: 'standard',
    message: "To disable the 'beep' when doors open, go to the App > Settings > Entry Delays & Chimes, and toggle 'Sensor Chimes' to OFF.",
    options: [
      { label: "Thanks", nextNodeId: "resolved" }
    ]
  },

  // ---------------------------------------------------------
  // NETWORK & CONNECTIVITY
  // ---------------------------------------------------------
  network_root: {
    id: 'network_root',
    type: 'standard',
    message: "Network reliability is critical. What are you experiencing?",
    options: [
      { label: "System went offline", nextNodeId: "net_offline" },
      { label: "Changed my Wi-Fi Router/Password", nextNodeId: "net_changed" },
      { label: "Cellular Backup Failed", nextNodeId: "net_cellular" },
      { label: "Go Back", nextNodeId: "root" }
    ]
  },
  net_offline: {
    id: 'net_offline',
    type: 'standard',
    message: "If the entire system is offline, the Gateway Hub has lost both Wi-Fi and Cellular connections. Is your home power currently out?",
    options: [
      { label: "Yes, power is out", nextNodeId: "net_power_out" },
      { label: "No, power is on", nextNodeId: "net_power_on" }
    ]
  },
  net_power_out: {
    id: 'net_power_out',
    type: 'standard',
    message: "During a power outage, the hub relies on cellular backup. If the cellular towers in your area are also down due to the storm, the system will reconnect automatically once the towers are restored.",
    options: [
      { label: "Understood", nextNodeId: "resolved" }
    ]
  },
  net_power_on: {
    id: 'net_power_on',
    type: 'standard',
    message: "Please reboot your Gateway Hub by unplugging it, removing the battery panel, taking out the battery, waiting 30 seconds, and putting it all back.",
    options: [
      { label: "That worked", nextNodeId: "resolved" },
      { label: "Still offline", nextNodeId: "whatsapp_handoff" }
    ]
  },
  net_changed: {
    id: 'net_changed',
    type: 'standard',
    message: "If you got a new router or changed your password, go to the SNOS app > Settings > Network, and follow the 'Update Wi-Fi' wizard via Bluetooth.",
    options: [
      { label: "Thanks!", nextNodeId: "resolved" }
    ]
  },
  net_cellular: {
    id: 'net_cellular',
    type: 'standard',
    message: "Cellular backup uses the AT&T or Verizon network. If you live in a rural area with bad reception, you may need an external cellular antenna.",
    options: [
      { label: "Order Antenna (WhatsApp)", nextNodeId: "whatsapp_handoff" },
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },

  // ---------------------------------------------------------
  // BILLING & ACCOUNT
  // ---------------------------------------------------------
  billing_root: {
    id: 'billing_root',
    type: 'standard',
    message: "For billing and account inquiries, what can I assist with?",
    options: [
      { label: "Update Credit Card", nextNodeId: "bill_card" },
      { label: "Cancel Subscription", nextNodeId: "bill_cancel" },
      { label: "Download Tax Invoice", nextNodeId: "bill_invoice" },
      { label: "Go Back", nextNodeId: "root" }
    ]
  },
  bill_card: {
    id: 'bill_card',
    type: 'standard',
    message: "To update your payment method, log in to the Web Dashboard on your computer and navigate to Account > Billing Details.",
    options: [
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },
  bill_cancel: {
    id: 'bill_cancel',
    type: 'standard',
    message: "We're sorry to see you go! Cancellations must be processed by our retention team to ensure secure deactivation of cellular monitoring.",
    options: [
      { label: "Connect to Team (WhatsApp)", nextNodeId: "whatsapp_handoff" },
      { label: "Nevermind", nextNodeId: "root" }
    ]
  },
  bill_invoice: {
    id: 'bill_invoice',
    type: 'standard',
    message: "Tax invoices for the past 24 months are available in the mobile app under Settings > Billing > View Statements as PDF downloads.",
    options: [
      { label: "Thanks", nextNodeId: "resolved" }
    ]
  },

  // ---------------------------------------------------------
  // EMERGENCY & FALSE ALARMS
  // ---------------------------------------------------------
  emergency_root: {
    id: 'emergency_root',
    type: 'standard',
    message: "Are you in an active emergency, or do you need help preventing false alarms?",
    options: [
      { label: "ACTIVE EMERGENCY - SEND HELP", nextNodeId: "emergency_active" },
      { label: "Stop a False Alarm", nextNodeId: "emergency_false" },
      { label: "Pet triggering motion sensor", nextNodeId: "emergency_pets" },
      { label: "Go Back", nextNodeId: "root" }
    ]
  },
  emergency_active: {
    id: 'emergency_active',
    type: 'standard',
    message: "🚨 THIS IS AN AUTOMATED SYSTEM. DO NOT USE THIS CHAT FOR EMERGENCIES. 🚨\n\nIf you have a professional monitoring plan, trigger the Panic Button in your SNOS app. Otherwise, immediately dial 911.",
    options: [
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },
  emergency_false: {
    id: 'emergency_false',
    type: 'standard',
    message: "To instantly cancel a false alarm, enter your Master PIN on the keypad or hit 'Cancel Alarm' in the SNOS mobile app within 30 seconds of the trigger.",
    options: [
      { label: "Got it", nextNodeId: "resolved" }
    ]
  },
  emergency_pets: {
    id: 'emergency_pets',
    type: 'standard',
    message: "Pets over 40lbs can trigger standard motion sensors. You can either invert the sensor (mount it upside down at 5ft) or purchase an advanced Pet-Immune radar.",
    options: [
      { label: "Order Pet Radar (WhatsApp)", nextNodeId: "whatsapp_handoff" },
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },

  // ---------------------------------------------------------
  // SALES & UPGRADES
  // ---------------------------------------------------------
  sales_root: {
    id: 'sales_root',
    type: 'standard',
    message: "Looking to expand your SNOS ecosystem? We have great deals going on right now.",
    options: [
      { label: "I want more cameras", nextNodeId: "sales_cams" },
      { label: "Upgrade Monitoring Plan", nextNodeId: "sales_plan" },
      { label: "Enterprise/Commercial Quote", nextNodeId: "whatsapp_handoff" },
      { label: "Go Back", nextNodeId: "root" }
    ]
  },
  sales_cams: {
    id: 'sales_cams',
    type: 'standard',
    message: "You can purchase add-on cameras directly from the 'Shop' tab in your app. Current users get an automatic 15% discount applied at checkout.",
    options: [
      { label: "Main Menu", nextNodeId: "root" }
    ]
  },
  sales_plan: {
    id: 'sales_plan',
    type: 'standard',
    message: "Upgrading to SNOS Elite gives you 24/7 Professional Monitoring, Cellular Backup, and 30-day cloud video retention. Would you like a sales rep to upgrade you?",
    options: [
      { label: "Yes, upgrade me (WhatsApp)", nextNodeId: "whatsapp_handoff" },
      { label: "No thanks", nextNodeId: "root" }
    ]
  },

  // ---------------------------------------------------------
  // WHATSAPP HANDOFF (End of tree)
  // ---------------------------------------------------------
  whatsapp_handoff: {
    id: 'whatsapp_handoff',
    type: 'whatsapp',
    message: "I am connecting you to our Human Support via WhatsApp Integration. Please type your message below to dispatch it to our live agents.",
  },

  // ---------------------------------------------------------
  // RESOLVED STATE
  // ---------------------------------------------------------
  resolved: {
    id: 'resolved',
    type: 'standard',
    message: "I'm glad I could help! Is there anything else you need assistance with today?",
    options: [
      { label: "Yes, something else", nextNodeId: "root" },
      { label: "No, I'm good", nextNodeId: "end" }
    ]
  },
  end: {
    id: 'end',
    type: 'standard',
    message: "Stay safe out there! Have a secure day.",
  }
};
