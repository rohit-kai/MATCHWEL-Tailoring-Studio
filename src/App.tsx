import React, { useState, useEffect } from "react";
import { 
  Scissors, Users, FileText, MessageSquare, 
  DollarSign, Activity, Plus, MapPin, 
  Download, Calendar, Trash2, PlusCircle,
  ChevronLeft, ChevronRight, RefreshCw
} from "lucide-react";
import "./App.css";

// --- Types & Schema Definitions ---
interface GarmentMeasurements {
  shirt: {
    length: string; // उंची
    chest: string;  // छाती
    waist: string;  // पोट
    seat: string;   // शिट
    shoulder: string; // शोल्डर
    sleeve: string;   // बाही
    collar: string;   // कॉलर
    cuff: string;     // कफ
    pocket: boolean;
    manela: boolean; // मनेला
    apple: boolean;  // ॲपल
    sideCut: boolean;
  };
  pant: {
    length: string; // उंची
    waist: string;  // कंबर
    seat: string;   // सीट
    knee: string;   // गुडघा
    bottom: string; // बॉटम
    thigh: string;  // मांडी
    inseam: string; // अंदर
    front: string;  // फ्रंट
    tight: boolean;
    loose: boolean;
  };
  kurta: {
    length: string;
    chest: string;
    waist: string;
    seat: string;
    shoulder: string;
    sleeve: string;
    collar: string;
  };
  safari: {
    length: string;
    chest: string;
    waist: string;
    seat: string;
    shoulder: string;
    sleeve: string;
    collar: string;
  };
  blazer: {
    length: string;
    chest: string;
    waist: string;
    seat: string;
    shoulder: string;
    sleeve: string;
    lapel: string;
    acrossBack: string;
  };
  sherwani: {
    length: string;
    chest: string;
    waist: string;
    seat: string;
    shoulder: string;
    sleeve: string;
    collar: string;
  };
  jacket: {
    length: string;
    chest: string;
    waist: string;
    seat: string;
    shoulder: string;
    sleeve: string;
  };
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  measurements: GarmentMeasurements;
}

interface OrderItem {
  name: string; // SHIRT, PANT, KURTA, SAFARI, JACKET, BLAZER, SHERWANI
  qty: number;
  rate: number;
}

interface Order {
  id: string; // Bill No
  customerId: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  deliveryDate: string;
  items: OrderItem[];
  status: "Draft" | "Stitching" | "Fitting" | "Ready" | "Delivered";
  notes: string;
}

interface CommLog {
  id: string;
  time: string;
  type: "WhatsApp" | "SMS";
  recipient: string;
  message: string;
  status: "Sent" | "Failed";
}

// Initial Mock Data
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Sunil Patil",
    phone: "9820994789",
    email: "sunil.patil@gmail.com",
    address: "Kharghar, Sector 12, Navi Mumbai",
    measurements: {
      shirt: { length: "30", chest: "40", waist: "36", seat: "38", shoulder: "18", sleeve: "24", collar: "16", cuff: "9.5", pocket: true, manela: true, apple: false, sideCut: true },
      pant: { length: "41", waist: "34", seat: "40", knee: "19", bottom: "16", thigh: "23", inseam: "31", front: "10.5", tight: true, loose: false },
      kurta: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "", collar: "" },
      safari: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "", collar: "" },
      blazer: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "", lapel: "", acrossBack: "" },
      sherwani: { length: "44", chest: "40", waist: "36", seat: "38", shoulder: "18", sleeve: "24", collar: "16" },
      jacket: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "" }
    }
  },
  {
    id: "c2",
    name: "Rajesh Shinde",
    phone: "9876543210",
    email: "rajesh.shinde@yahoo.com",
    address: "Panvel, Near Station",
    measurements: {
      shirt: { length: "29", chest: "38", waist: "34", seat: "37", shoulder: "17.5", sleeve: "23.5", collar: "15.5", cuff: "9", pocket: true, manela: false, apple: true, sideCut: false },
      pant: { length: "40", waist: "32", seat: "38", knee: "18", bottom: "15.5", thigh: "22", inseam: "30", front: "10", tight: false, loose: true },
      kurta: { length: "40", chest: "38", waist: "34", seat: "38", shoulder: "17.5", sleeve: "23.5", collar: "15.5" },
      safari: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "", collar: "" },
      blazer: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "", lapel: "", acrossBack: "" },
      sherwani: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "", collar: "" },
      jacket: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "" }
    }
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "0",
    customerId: "c1",
    customerName: "Sunil Patil",
    customerPhone: "9820994789",
    bookingDate: "2026-07-13",
    deliveryDate: "2026-07-13", // Today's date to verify today's list filter
    items: [
      { name: "SHIRT", qty: 6, rate: 500 },
      { name: "PANT", qty: 2, rate: 600 }
    ],
    status: "Stitching",
    notes: "Special gold lining for Sherwani"
  },
  {
    id: "1",
    customerId: "c2",
    customerName: "Rajesh Shinde",
    customerPhone: "9876543210",
    bookingDate: "2026-07-12",
    deliveryDate: "2026-07-18",
    items: [
      { name: "SHIRT", qty: 2, rate: 500 },
      { name: "PANT", qty: 2, rate: 600 }
    ],
    status: "Draft",
    notes: "Slim fit trousers"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "calendar" | "crm" | "invoices" | "comms" | "backup">("dashboard");
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("matchwel_customers");
    if (saved) return JSON.parse(saved);
    const isInit = localStorage.getItem("matchwel_initialized");
    if (isInit === "false") return [];
    return INITIAL_CUSTOMERS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("matchwel_orders");
    if (saved) return JSON.parse(saved);
    const isInit = localStorage.getItem("matchwel_initialized");
    if (isInit === "false") return [];
    return INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem("matchwel_customers", JSON.stringify(customers));
    if (customers.length > 0 && localStorage.getItem("matchwel_initialized") !== "true") {
      localStorage.setItem("matchwel_initialized", "true");
    }
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("matchwel_orders", JSON.stringify(orders));
  }, [orders]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("c1");
  const [commsLog, setCommsLog] = useState<CommLog[]>(() => {
    const saved = localStorage.getItem("matchwel_comms_log");
    if (saved) return JSON.parse(saved);
    const isInit = localStorage.getItem("matchwel_initialized");
    if (isInit === "false") return [];
    return [
      { id: "l1", time: "09:12:00", type: "SMS", recipient: "Sunil Patil", message: "MATCHWEL: Hi Sunil Patil, your stitching of the shirt and pant (Bill No: #0) is ready! Just pick up from our store. - MATCHWEL TAILORS", status: "Sent" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("matchwel_comms_log", JSON.stringify(commsLog));
  }, [commsLog]);

  // Calendar states
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(6); // 0-indexed, so 6 is July
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>("2026-07-13");
  const [googleSyncActive, setGoogleSyncActive] = useState(false);
  const [googleSyncLogs, setGoogleSyncLogs] = useState<string[]>([
    "System ready. Local storage synced."
  ]);

  // Invoice Selected state
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>("0");
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [dashboardDeliveryFilter, setDashboardDeliveryFilter] = useState<"today" | "all">("today");
  const [commsDeliveryFilter, setCommsDeliveryFilter] = useState<"today" | "all">("today");
  const [whatsappSenderNum, setWhatsappSenderNum] = useState("7028331155");

  // Single unified "Add stitch booking & customer" form modal state
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Form Fields State
  const [custPhone, setCustPhone] = useState("");
  const [custName, setCustName] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("2026-07-20");
  const [isExistingClient, setIsExistingClient] = useState(false);

  // Checkboxes list of active categories on modal form
  const [visibleSpecCategories, setVisibleSpecCategories] = useState<string[]>(["shirt", "pant"]);

  // Orders pipeline tab status filter state
  const [ordersPipelineFilter, setOrdersPipelineFilter] = useState<string>("All");

  // Shirt form parameters
  const [sLength, setSLength] = useState("");
  const [sChest, setSChest] = useState("");
  const [sWaist, setSWaist] = useState("");
  const [sSeat, setSSeat] = useState("");
  const [sShoulder, setSShoulder] = useState("");
  const [sSleeve, setSSleeve] = useState("");
  const [sCollar, setSCollar] = useState("");
  const [sCuff, setSCuff] = useState("");
  const [sPocket, setSPocket] = useState(true);
  const [sManela, setSManela] = useState(false);
  const [sApple, setSApple] = useState(false);
  const [sSideCut, setSSideCut] = useState(false);

  // Pant form parameters
  const [pLength, setPLength] = useState("");
  const [pWaist, setPWaist] = useState("");
  const [pSeat, setPSeat] = useState("");
  const [pKnee, setPKnee] = useState("");
  const [pBottom, setPBottom] = useState("");
  const [pThigh, setPThigh] = useState("");
  const [pInseam, setPInseam] = useState("");
  const [pFront, setPFront] = useState("");
  const [pTight, setPTight] = useState(false);
  const [pLoose, setPLoose] = useState(false);

  // Kurta parameters
  const [kLength, setKLength] = useState("");
  const [kChest, setKChest] = useState("");
  const [kWaist, setKWaist] = useState("");
  const [kSeat, setKSeat] = useState("");
  const [kShoulder, setKShoulder] = useState("");
  const [kSleeve, setKSleeve] = useState("");
  const [kCollar, setKCollar] = useState("");

  // Safari parameters
  const [sfLength, setSfLength] = useState("");
  const [sfChest, setSfChest] = useState("");
  const [sfWaist, setSfWaist] = useState("");
  const [sfSeat, setSfSeat] = useState("");
  const [sfShoulder, setSfShoulder] = useState("");
  const [sfSleeve, setSfSleeve] = useState("");
  const [sfCollar, setSfCollar] = useState("");

  // Blazer parameters
  const [bLength, setBLength] = useState("");
  const [bChest, setBChest] = useState("");
  const [bWaist, setBWaist] = useState("");
  const [bSeat, setBSeat] = useState("");
  const [bShoulder, setBShoulder] = useState("");
  const [bSleeve, setBSleeve] = useState("");
  const [bLapel, setBLapel] = useState("");
  const [bAcrossBack, setBAcrossBack] = useState("");

  // Sherwani parameters
  const [shLength, setShLength] = useState("");
  const [shChest, setShChest] = useState("");
  const [shWaist, setShWaist] = useState("");
  const [shSeat, setShSeat] = useState("");
  const [shShoulder, setShShoulder] = useState("");
  const [shSleeve, setShSleeve] = useState("");
  const [shCollar, setShCollar] = useState("");

  // Jacket parameters
  const [jLength, setJLength] = useState("");
  const [jChest, setJChest] = useState("");
  const [jWaist, setJWaist] = useState("");
  const [jSeat, setJSeat] = useState("");
  const [jShoulder, setJShoulder] = useState("");
  const [jSleeve, setJSleeve] = useState("");

  // Flexible dropdown item billing rows
  interface BookingRow {
    garment: string; // SHIRT, PANT, etc.
    qty: number;
    rate: number;
  }
  const [billingRows, setBillingRows] = useState<BookingRow[]>([
    { garment: "SHIRT", qty: 0, rate: 500 }
  ]);

  // Edit Customer Demographics state
  const [isEditingDemographics, setIsEditingDemographics] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Active tab inside CRM Workspace
  const [crmMeasurementCategory, setCrmMeasurementCategory] = useState<keyof GarmentMeasurements>("shirt");

  // Autofill if mobile number matches
  useEffect(() => {
    if (custPhone.length >= 10) {
      const match = customers.find(c => c.phone.replace(/\D/g, "") === custPhone.replace(/\D/g, ""));
      if (match) {
        setIsExistingClient(true);
        setCustName(match.name);
        setCustAddress(match.address);
        setCustEmail(match.email);
        
        // Load measurements
        setSLength(match.measurements.shirt.length || "");
        setSChest(match.measurements.shirt.chest || "");
        setSWaist(match.measurements.shirt.waist || "");
        setSSeat(match.measurements.shirt.seat || "");
        setSShoulder(match.measurements.shirt.shoulder || "");
        setSSleeve(match.measurements.shirt.sleeve || "");
        setSCollar(match.measurements.shirt.collar || "");
        setSCuff(match.measurements.shirt.cuff || "");
        setSPocket(match.measurements.shirt.pocket);
        setSManela(match.measurements.shirt.manela);
        setSApple(match.measurements.shirt.apple);
        setSSideCut(match.measurements.shirt.sideCut);

        setPLength(match.measurements.pant.length || "");
        setPWaist(match.measurements.pant.waist || "");
        setPSeat(match.measurements.pant.seat || "");
        setPKnee(match.measurements.pant.knee || "");
        setPBottom(match.measurements.pant.bottom || "");
        setPThigh(match.measurements.pant.thigh || "");
        setPInseam(match.measurements.pant.inseam || "");
        setPFront(match.measurements.pant.front || "");
        setPTight(match.measurements.pant.tight);
        setPLoose(match.measurements.pant.loose);

        setKLength(match.measurements.kurta.length || "");
        setKChest(match.measurements.kurta.chest || "");
        setKWaist(match.measurements.kurta.waist || "");
        setKSeat(match.measurements.kurta.seat || "");
        setKShoulder(match.measurements.kurta.shoulder || "");
        setKSleeve(match.measurements.kurta.sleeve || "");
        setKCollar(match.measurements.kurta.collar || "");

        setSfLength(match.measurements.safari.length || "");
        setSfChest(match.measurements.safari.chest || "");
        setSfWaist(match.measurements.safari.waist || "");
        setSfSeat(match.measurements.safari.seat || "");
        setSfShoulder(match.measurements.safari.shoulder || "");
        setSfSleeve(match.measurements.safari.sleeve || "");
        setSfCollar(match.measurements.safari.collar || "");

        setBLength(match.measurements.blazer.length || "");
        setBChest(match.measurements.blazer.chest || "");
        setBWaist(match.measurements.blazer.waist || "");
        setBSeat(match.measurements.blazer.seat || "");
        setBShoulder(match.measurements.blazer.shoulder || "");
        setBSleeve(match.measurements.blazer.sleeve || "");
        setBLapel(match.measurements.blazer.lapel || "");
        setBAcrossBack(match.measurements.blazer.acrossBack || "");

        setShLength(match.measurements.sherwani.length || "");
        setShChest(match.measurements.sherwani.chest || "");
        setShWaist(match.measurements.sherwani.waist || "");
        setShSeat(match.measurements.sherwani.seat || "");
        setShShoulder(match.measurements.sherwani.shoulder || "");
        setShSleeve(match.measurements.sherwani.sleeve || "");
        setShCollar(match.measurements.sherwani.collar || "");

        setJLength(match.measurements.jacket.length || "");
        setJChest(match.measurements.jacket.chest || "");
        setJWaist(match.measurements.jacket.waist || "");
        setJSeat(match.measurements.jacket.seat || "");
        setJShoulder(match.measurements.jacket.shoulder || "");
        setJSleeve(match.measurements.jacket.sleeve || "");

        // Determine which garments have existing data to display them by default
        const activeCategories: string[] = [];
        if (match.measurements.shirt.length || match.measurements.shirt.chest) activeCategories.push("shirt");
        if (match.measurements.pant.length || match.measurements.pant.waist) activeCategories.push("pant");
        if (match.measurements.kurta.length || match.measurements.kurta.chest) activeCategories.push("kurta");
        if (match.measurements.safari.length || match.measurements.safari.chest) activeCategories.push("safari");
        if (match.measurements.blazer.length || match.measurements.blazer.chest) activeCategories.push("blazer");
        if (match.measurements.sherwani.length || match.measurements.sherwani.chest) activeCategories.push("sherwani");
        if (match.measurements.jacket.length || match.measurements.jacket.chest) activeCategories.push("jacket");
        
        // If they had absolutely no measurements, default to shirt & pant
        if (activeCategories.length === 0) {
          setVisibleSpecCategories(["shirt", "pant"]);
        } else {
          setVisibleSpecCategories(activeCategories);
        }
      } else {
        setIsExistingClient(false);
      }
    } else {
      setIsExistingClient(false);
    }
  }, [custPhone, customers]);

  // Set booking timestamp upon opening form
  const handleOpenAddForm = () => {
    const now = new Date();
    setBookingDate(now.toLocaleString("en-GB"));
    setVisibleSpecCategories(["shirt", "pant"]);
    setShowAddCustomerModal(true);
  };

  // Checkbox toggle handler
  const handleSpecCheckboxToggle = (cat: string) => {
    setVisibleSpecCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Add a billing row
  const addBillingRow = () => {
    setBillingRows(prev => [...prev, { garment: "SHIRT", qty: 0, rate: 500 }]);
  };

  // Remove a billing row
  const removeBillingRow = (index: number) => {
    setBillingRows(prev => prev.filter((_, i) => i !== index));
  };

  // Handle billing row change and auto-append row if last row is updated
  const handleBillingRowChange = (index: number, key: keyof BookingRow, value: any) => {
    setBillingRows(prev => {
      const updatedList = prev.map((row, i) => {
        if (i === index) {
          const updated = { ...row, [key]: value };
          if (key === "garment") {
            // Autofill standard rates
            updated.rate = 
              value === "SHIRT" ? 500 :
              value === "PANT" ? 600 :
              value === "KURTA" ? 800 :
              value === "SAFARI" ? 1200 :
              value === "JACKET" ? 1500 :
              value === "BLAZER" ? 2500 : 8000;
          }
          return updated;
        }
        return row;
      });

      // Auto-append if the edited row is the last row, and has a qty > 0 or has changed garment selection
      const isLastRow = index === prev.length - 1;
      const isFilled = (key === "qty" && Number(value) > 0) || (key === "rate" && Number(value) > 0);
      
      if (isLastRow && isFilled) {
        return [...updatedList, { garment: "SHIRT", qty: 0, rate: 500 }];
      }

      return updatedList;
    });
  };

  // Submit client, measurements, order, and trigger print
  const handleSaveAndPrint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;

    let targetClientId = "";
    
    // Check if client is new or existing
    const match = customers.find(c => c.phone.replace(/\D/g, "") === custPhone.replace(/\D/g, ""));
    if (match) {
      targetClientId = match.id;
      // Update existing measurements
      setCustomers(prev => prev.map(c => {
        if (c.id === match.id) {
          return {
            ...c,
            measurements: {
              shirt: { length: sLength || "0", chest: sChest || "0", waist: sWaist || "0", seat: sSeat || "0", shoulder: sShoulder || "0", sleeve: sSleeve || "0", collar: sCollar || "0", cuff: sCuff || "0", pocket: sPocket, manela: sManela, apple: sApple, sideCut: sSideCut },
              pant: { length: pLength || "0", waist: pWaist || "0", seat: pSeat || "0", knee: pKnee || "0", bottom: pBottom || "0", thigh: pThigh || "0", inseam: pInseam || "0", front: pFront || "0", tight: pTight, loose: pLoose },
              kurta: { length: kLength || "0", chest: kChest || "0", waist: kWaist || "0", seat: kSeat || "0", shoulder: kShoulder || "0", sleeve: kSleeve || "0", collar: kCollar || "0" },
              safari: { length: sfLength || "0", chest: sfChest || "0", waist: sfWaist || "0", seat: sfSeat || "0", shoulder: sfShoulder || "0", sleeve: sfSleeve || "0", collar: sfCollar || "0" },
              blazer: { length: bLength || "0", chest: bChest || "0", waist: bWaist || "0", seat: bSeat || "0", shoulder: bShoulder || "0", sleeve: bSleeve || "0", lapel: bLapel || "0", acrossBack: bAcrossBack || "0" },
              sherwani: { length: shLength || "0", chest: shChest || "0", waist: shWaist || "0", seat: shSeat || "0", shoulder: shShoulder || "0", sleeve: shSleeve || "0", collar: shCollar || "0" },
              jacket: { length: jLength || "0", chest: jChest || "0", waist: jWaist || "0", seat: jSeat || "0", shoulder: jShoulder || "0", sleeve: jSleeve || "0" }
            }
          };
        }
        return c;
      }));
    } else {
      // Create new customer
      targetClientId = "c" + (customers.length + 1);
      const newCust: Customer = {
        id: targetClientId,
        name: custName,
        phone: custPhone,
        email: custEmail || `${custName.toLowerCase().replace(/\s/g, "")}@gmail.com`,
        address: custAddress || "Local",
        measurements: {
          shirt: { length: sLength || "0", chest: sChest || "0", waist: sWaist || "0", seat: sSeat || "0", shoulder: sShoulder || "0", sleeve: sSleeve || "0", collar: sCollar || "0", cuff: sCuff || "0", pocket: sPocket, manela: sManela, apple: sApple, sideCut: sSideCut },
          pant: { length: pLength || "0", waist: pWaist || "0", seat: pSeat || "0", knee: pKnee || "0", bottom: pBottom || "0", thigh: pThigh || "0", inseam: pInseam || "0", front: pFront || "0", tight: pTight, loose: pLoose },
          kurta: { length: kLength || "0", chest: kChest || "0", waist: kWaist || "0", seat: kSeat || "0", shoulder: kShoulder || "0", sleeve: kSleeve || "0", collar: kCollar || "0" },
          safari: { length: sfLength || "0", chest: sfChest || "0", waist: sfWaist || "0", seat: sfSeat || "0", shoulder: sfShoulder || "0", sleeve: sfSleeve || "0", collar: sfCollar || "0" },
          blazer: { length: bLength || "0", chest: bChest || "0", waist: bWaist || "0", seat: bSeat || "0", shoulder: bShoulder || "0", sleeve: bSleeve || "0", lapel: bLapel || "0", acrossBack: bAcrossBack || "0" },
          sherwani: { length: shLength || "0", chest: shChest || "0", waist: shWaist || "0", seat: shSeat || "0", shoulder: shShoulder || "0", sleeve: shSleeve || "0", collar: shCollar || "0" },
          jacket: { length: jLength || "0", chest: jChest || "0", waist: jWaist || "0", seat: jSeat || "0", shoulder: jShoulder || "0", sleeve: jSleeve || "0" }
        }
      };
      setCustomers(prev => [...prev, newCust]);
    }

    // Book Order Bill
    const newBillNo = String(orders.length);
    
    // Map dynamic billing rows to order items
    const itemsMap: Record<string, OrderItem> = {
      SHIRT: { name: "SHIRT", qty: 0, rate: 500 },
      PANT: { name: "PANT", qty: 0, rate: 600 },
      KURTA: { name: "KURTA", qty: 0, rate: 800 },
      SAFARI: { name: "SAFARI", qty: 0, rate: 1200 },
      JACKET: { name: "JACKET", qty: 0, rate: 1500 },
      BLAZER: { name: "BLAZER", qty: 0, rate: 2500 },
      SHERWANI: { name: "SHERWANI", qty: 0, rate: 8000 }
    };
    billingRows.forEach(row => {
      if (itemsMap[row.garment]) {
        itemsMap[row.garment].qty += row.qty;
        itemsMap[row.garment].rate = row.rate;
      }
    });

    const newOrder: Order = {
      id: newBillNo,
      customerId: targetClientId,
      customerName: custName,
      customerPhone: custPhone,
      bookingDate: bookingDate.split(",")[0] || new Date().toISOString().split('T')[0],
      deliveryDate: deliveryDate,
      items: Object.values(itemsMap).filter(item => item.qty > 0),
      status: "Draft",
      notes: "A5 Form Booking"
    };

    setOrders(prev => [...prev, newOrder]);
    setSelectedCustomerId(targetClientId);
    setActiveInvoiceId(newBillNo);
    setShowAddCustomerModal(false);

    // Logs SMS trigger
    const time = new Date().toLocaleTimeString("en-GB");
    setCommsLog(log => [
      {
        id: "l" + (log.length + 1),
        time,
        type: "SMS",
        recipient: custName,
        message: `MATCHWEL: Bill #${newBillNo} booked successfully for ₹${calculateTotal(newOrder)}. Delivery: ${deliveryDate}.`,
        status: "Sent"
      },
      ...log
    ]);

    // Switch tab to Invoices and pop print dialog immediately
    setActiveTab("invoices");
    setTimeout(() => {
      window.print();
    }, 500);

    // Reset Form Fields
    setCustName(""); setCustPhone(""); setCustAddress(""); setCustEmail("");
    setSLength(""); setSChest(""); setSWaist(""); setSSeat(""); setSShoulder(""); setSSleeve(""); setSCollar(""); setSCuff("");
    setPLength(""); setPWaist(""); setPSeat(""); setPKnee(""); setPBottom(""); setPThigh(""); setPInseam(""); setPFront("");
    setKLength(""); setKChest(""); setKWaist(""); setKSeat(""); setKShoulder(""); setKSleeve(""); setKCollar("");
    setSfLength(""); setSfChest(""); setSfWaist(""); setSfSeat(""); setSfShoulder(""); setSfSleeve(""); setSfCollar("");
    setBLength(""); setBChest(""); setBWaist(""); setBSeat(""); setBShoulder(""); setBSleeve(""); setBLapel(""); setBAcrossBack("");
    setShLength(""); setShChest(""); setShWaist(""); setShSeat(""); setShShoulder(""); setShSleeve(""); setShCollar("");
    setJLength(""); setJChest(""); setJWaist(""); setJSeat(""); setJShoulder(""); setJSleeve("");
    setBillingRows([{ garment: "SHIRT", qty: 0, rate: 500 }]);
    setIsExistingClient(false);
  };

  // Modify Delivery Date on Dashboard
  const updateDeliveryDate = (orderId: string, newDate: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const time = new Date().toLocaleTimeString("en-GB");
        setCommsLog(log => [
          {
            id: "l" + (log.length + 1),
            time,
            type: "WhatsApp",
            recipient: o.customerName,
            message: `Update: Delivery date for MATCHWEL order Bill No #${o.id} is rescheduled to ${newDate}.`,
            status: "Sent"
          },
          ...log
        ]);
        return { ...o, deliveryDate: newDate };
      }
      return o;
    }));
  };

  // Save Inline Demographics Edit in CRM tab
  const handleSaveDemographics = () => {
    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCustomerId) {
        return {
          ...c,
          name: editName || c.name,
          phone: editPhone || c.phone,
          email: editEmail || c.email,
          address: editAddress || c.address
        };
      }
      return c;
    }));
    setIsEditingDemographics(false);
  };

  // Start Edit Mode for Demographics in CRM tab
  const startEditDemographics = (cust: Customer) => {
    setEditName(cust.name);
    setEditPhone(cust.phone);
    setEditEmail(cust.email);
    setEditAddress(cust.address);
    setIsEditingDemographics(true);
  };

  // Handle crm measurement updates
  const handleCrmMeasurementFieldChange = (field: string, value: string | boolean) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCustomerId) {
        return {
          ...c,
          measurements: {
            ...c.measurements,
            [crmMeasurementCategory]: {
              ...c.measurements[crmMeasurementCategory],
              [field]: value
            }
          }
        };
      }
      return c;
    }));
  };

  // Delete Order
  const handleDeleteOrder = (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const time = new Date().toLocaleTimeString("en-GB");
        setCommsLog(log => [
          {
            id: "l" + (log.length + 1),
            time,
            type: "WhatsApp",
            recipient: o.customerName,
            message: `MATCHWEL TAILORS: Status of your order #${o.id} is now updated to: ${status.toUpperCase()}.`,
            status: "Sent"
          },
          ...log
        ]);
        return { ...o, status };
      }
      return o;
    }));
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const selectedInvoiceOrder = orders.find(o => o.id === activeInvoiceId) || orders[0];
  const invoiceCustomer = customers.find(c => c.id === selectedInvoiceOrder.customerId) || selectedCustomer;

  // Calculate order total
  const calculateTotal = (order: Order) => {
    return order.items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  };

  // Filter client list
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  // Get orders history for selected customer
  const customerOrdersHistory = orders.filter(o => o.customerId === selectedCustomerId);

  // Live total of the active modal order form
  const activeModalTotal = billingRows.reduce((acc, row) => acc + (row.qty * row.rate), 0);

  // Filter orders for the pipeline
  const filteredPipelineOrders = orders.filter(o => {
    const statusMatches = ordersPipelineFilter === "All" || o.status === ordersPipelineFilter;
    const searchMatches = searchQuery === "" || 
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.customerPhone.includes(searchQuery) || 
      o.id.includes(searchQuery);
    return statusMatches && searchMatches;
  });

  // Filter invoices list by search query (bill no or customer name/phone)
  const filteredInvoiceOrders = orders.filter(o => {
    return invoiceSearchQuery === "" || 
      o.customerName.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) || 
      o.customerPhone.includes(invoiceSearchQuery) || 
      o.id.includes(invoiceSearchQuery);
  });

  return (
    <>
      {/* Dedicated print-only container bypasses the complex layout wrappers */}
      {selectedInvoiceOrder && (
        <div className="print-only-container">
          <div className="paper-invoice">
            {/* Header */}
            <div className="paper-header">
              <div className="paper-brand-area">
                <div className="paper-brand-main">Custom Tailoring</div>
                <div className="paper-brand-sub">MATCHWEL TAILORS</div>
              </div>
              <div className="paper-master-box">
                <div className="paper-master-title">MASTER</div>
                <div className="paper-master-phone">7028331155</div>
              </div>
              <div className="paper-bill-no-box">
                <div className="paper-bill-title">Bill No.:</div>
                <div className="paper-bill-no">{selectedInvoiceOrder.id}</div>
              </div>
            </div>

            {/* Meta info */}
            <div className="paper-meta-row">
              <div className="paper-meta-item">
                <span className="label">Cust. Name:</span>
                <span className="value">{selectedInvoiceOrder.customerName}</span>
              </div>
              <div className="paper-meta-item">
                <span className="label">Mob. No.:</span>
                <span className="value">{selectedInvoiceOrder.customerPhone}</span>
              </div>
              <div className="paper-meta-item">
                <span className="label">Date:</span>
                <span className="value">{selectedInvoiceOrder.bookingDate}</span>
              </div>
              <div className="paper-meta-item">
                <span className="label">Delivery Date:</span>
                <span className="value" style={{ fontWeight: 800 }}>{selectedInvoiceOrder.deliveryDate}</span>
              </div>
            </div>

            {/* Items */}
            <table className="paper-table">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>No.</th>
                  <th>Description</th>
                  <th style={{ width: "80px", textAlign: "center" }}>Qty.</th>
                  <th style={{ width: "100px", textAlign: "right" }}>Rate (₹)</th>
                  <th style={{ width: "120px", textAlign: "right" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoiceOrder.items.map((item, index) => (
                  <tr key={item.name}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td style={{ fontWeight: "700" }}>{item.name}</td>
                    <td style={{ textAlign: "center" }}>{item.qty}</td>
                    <td style={{ textAlign: "right" }}>{item.rate}</td>
                    <td style={{ textAlign: "right", fontWeight: "700" }}>₹{item.qty * item.rate}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={4} style={{ textAlign: "right", fontWeight: "800" }}>Total Amount -</td>
                  <td style={{ textAlign: "right", fontWeight: "800" }}>₹{calculateTotal(selectedInvoiceOrder)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.85rem", fontWeight: "700" }}>
              <div>Working Hours: 10 a.m. To 8 p.m.</div>
              <div style={{ borderTop: "1px solid #000", width: "150px", textAlign: "center", marginTop: "1rem" }}>Sign.</div>
            </div>

            {/* Print measurements */}
            <div className="paper-measurements-section">
              <div className="paper-measure-box">
                <div className="paper-measure-title">
                  <span>PANT (पैंट) MEASUREMENTS</span>
                  <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
                    Fit: {invoiceCustomer.measurements.pant.tight ? "फिट (Tight) ✓ " : ""}{invoiceCustomer.measurements.pant.loose ? "लूस (Loose) ✓" : ""}
                  </span>
                </div>
                <div className="paper-measure-grid">
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">उंची</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.length}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">कंबर</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.waist}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">सीट</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.seat}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">गुडघा</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.knee}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">बॉटम</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.bottom}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">मांडी</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.thigh}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">अंदर</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.inseam}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">फ्रंट</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.front}</span></div>
                </div>
              </div>

              <div className="paper-measure-box">
                <div className="paper-measure-title">
                  <span>SHIRT (शर्ट) MEASUREMENTS</span>
                  <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
                    Options: {invoiceCustomer.measurements.shirt.pocket ? "पॉकेट ✓ " : ""}{invoiceCustomer.measurements.shirt.manela ? "मनेला ✓ " : ""}{invoiceCustomer.measurements.shirt.apple ? "ॲपल ✓ " : ""}{invoiceCustomer.measurements.shirt.sideCut ? "साईड कट ✓" : ""}
                  </span>
                </div>
                <div className="paper-measure-grid">
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">उंची</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.length}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">छाती</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.chest}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">पोट</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.waist}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">शिट</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.seat}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">शोल्डर</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.shoulder}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">बाही</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.sleeve}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">कॉलर</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.collar}</span></div>
                  <div className="paper-measure-cell"><span className="paper-measure-cell-label">कफ</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.cuff}</span></div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#666", marginTop: "1rem", borderTop: "1px dashed #aaa", paddingTop: "0.5rem" }}>
              Thank You... Visit Again
            </div>
          </div>
        </div>
      )}

      {/* Main Desktop Dashboard App */}
      <div className="app-container">
        <aside className="sidebar">
          <div className="brand-section">
            <h2 className="brand-name">MATCHWEL</h2>
            <div className="brand-subtitle">Tailoring Studio</div>
          </div>

          <nav className="nav-links">
            <div className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
              <Activity size={18} />
              <span>Dashboard</span>
            </div>
            <div className={`nav-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
              <Scissors size={18} />
              <span>Orders Pipeline</span>
            </div>
            <div className={`nav-item ${activeTab === "calendar" ? "active" : ""}`} onClick={() => setActiveTab("calendar")}>
              <Calendar size={18} />
              <span>Delivery Calendar</span>
            </div>
            <div className={`nav-item ${activeTab === "crm" ? "active" : ""}`} onClick={() => setActiveTab("crm")}>
              <Users size={18} />
              <span>CRM & Profiling</span>
            </div>
            <div className={`nav-item ${activeTab === "invoices" ? "active" : ""}`} onClick={() => setActiveTab("invoices")}>
              <FileText size={18} />
              <span>Invoices</span>
            </div>
            <div className={`nav-item ${activeTab === "comms" ? "active" : ""}`} onClick={() => setActiveTab("comms")}>
              <MessageSquare size={18} />
              <span>Communications Hub</span>
            </div>
            <div className={`nav-item ${activeTab === "backup" ? "active" : ""}`} onClick={() => setActiveTab("backup")}>
              <Download size={18} />
              <span>Data Import/Export</span>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="created-by" style={{ fontSize: "0.85rem" }}>
              created by <a href="https://rohit-kai.github.io/cyber-portfolio/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-gold)", fontWeight: 600, textDecoration: "none" }}>rohit-kai</a>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
              <a href="https://rohit-kai.github.io/cyber-portfolio/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>click to know about me</a>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="header-bar">
            <div className="page-title">
              <h1>
                {activeTab === "dashboard" && "Tailoring Operational Suite"}
                {activeTab === "orders" && "Stitching Orders Pipeline"}
                {activeTab === "calendar" && "Bespoke Delivery Calendar"}
                {activeTab === "crm" && "Bespoke Fitting Books"}
                {activeTab === "invoices" && "Bespoke Printed Invoice"}
                {activeTab === "comms" && "Client Alerts Gateways"}
                {activeTab === "backup" && "System Data Sync Hub (CSV)"}
              </h1>
              <p>MATCHWEL CUSTOM TAILORING SYSTEM</p>
            </div>

            <button className="btn btn-primary" onClick={handleOpenAddForm}>
              <Plus size={16} /> New Stitching Bill Form
            </button>
          </div>

          {/* 1. Dashboard */}
          {activeTab === "dashboard" && (
            <div>
              <div className="btn-dashboard-giant" onClick={handleOpenAddForm}>
                <Users size={40} style={{ color: "var(--color-gold)", strokeWidth: 1.5 }} />
                <div className="btn-dashboard-giant-title">Book Stitching Order Form</div>
                <div className="btn-dashboard-giant-desc">
                  Open the lookup register to search clients by phone number, check previous order histories, enter dynamic measurements, and build invoices.
                </div>
              </div>

              <div className="metrics-grid">
                <div className="glass-card metric-card">
                  <div className="metric-icon-box"><DollarSign size={24} /></div>
                  <div className="metric-info">
                    <h3>Pending Billings</h3>
                    <p>₹{orders.reduce((acc, o) => acc + calculateTotal(o), 0)}</p>
                  </div>
                </div>
                <div className="glass-card metric-card">
                  <div className="metric-icon-box"><Scissors size={24} /></div>
                  <div className="metric-info">
                    <h3>Active Orders</h3>
                    <p>{orders.filter(o => o.status !== "Delivered").length}</p>
                  </div>
                </div>
                <div className="glass-card metric-card">
                  <div className="metric-icon-box"><Users size={24} /></div>
                  <div className="metric-info">
                    <h3>Fitting Accounts</h3>
                    <p>{customers.length}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", margin: 0, fontSize: "0.9rem" }}>
                    Delivery Calendar Deadlines
                  </h3>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button 
                      className={`btn ${dashboardDeliveryFilter === "today" ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                      onClick={() => setDashboardDeliveryFilter("today")}
                    >
                      Today's Deliveries
                    </button>
                    <button 
                      className={`btn ${dashboardDeliveryFilter === "all" ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                      onClick={() => setDashboardDeliveryFilter("all")}
                    >
                      All Deliveries
                    </button>
                  </div>
                </div>

                <div className="delivery-calendar-list">
                  {orders
                    .filter(o => {
                      if (dashboardDeliveryFilter === "today") {
                        const todayStr = new Date().toISOString().split("T")[0];
                        return o.deliveryDate === todayStr;
                      }
                      return true;
                    })
                    .map(o => (
                      <div key={o.id} className="delivery-calendar-item">
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{o.customerName}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
                            Bill No: #{o.id} | Contact: {o.customerPhone}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                            Garments: {o.items.map(item => `${item.name} (${item.qty})`).join(", ")}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div className="delivery-date-badge">
                            <Calendar size={14} />
                            <span>Delivery: {o.deliveryDate}</span>
                          </div>

                          <input 
                            type="date" 
                            value={o.deliveryDate}
                            style={{
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-gold)",
                              borderRadius: "4px",
                              color: "white",
                              padding: "0.3rem 0.5rem",
                              fontSize: "0.85rem"
                            }}
                            onChange={e => updateDeliveryDate(o.id, e.target.value)}
                          />

                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                            onClick={() => alert(`Resent WhatsApp/SMS alerts to ${o.customerName}!`)}
                          >
                            Notify Date
                          </button>
                        </div>
                      </div>
                    ))}

                  {orders.filter(o => {
                    if (dashboardDeliveryFilter === "today") {
                      const todayStr = new Date().toISOString().split("T")[0];
                      return o.deliveryDate === todayStr;
                    }
                    return true;
                  }).length === 0 && (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>
                      No deliveries scheduled for today.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 1b. Orders Pipeline Workflow Screen */}
          {activeTab === "orders" && (
            <div>
              {/* Metrics row */}
              <div className="metrics-grid">
                <div className="glass-card metric-card">
                  <div className="metric-icon-box" style={{ background: "rgba(245,158,11,0.1)" }}><Scissors size={20} /></div>
                  <div className="metric-info">
                    <h3>In Stitching</h3>
                    <p>{orders.filter(o => o.status === "Stitching").length}</p>
                  </div>
                </div>
                <div className="glass-card metric-card">
                  <div className="metric-icon-box" style={{ background: "rgba(59,130,246,0.1)" }}><Users size={20} /></div>
                  <div className="metric-info">
                    <h3>In Fitting</h3>
                    <p>{orders.filter(o => o.status === "Fitting").length}</p>
                  </div>
                </div>
                <div className="glass-card metric-card">
                  <div className="metric-icon-box" style={{ background: "rgba(16,185,129,0.1)" }}><Activity size={20} /></div>
                  <div className="metric-info">
                    <h3>Ready for Delivery</h3>
                    <p>{orders.filter(o => o.status === "Ready").length}</p>
                  </div>
                </div>
              </div>

              {/* Filtering Controls Bar */}
              <div className="glass-card" style={{ marginBottom: "1.5rem", padding: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  
                  {/* Status Toggle Buttons */}
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {(["All", "Draft", "Stitching", "Fitting", "Ready", "Delivered"] as const).map(status => (
                      <button 
                        key={status}
                        className={`btn ${ordersPipelineFilter === status ? "btn-primary" : "btn-secondary"}`}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                        onClick={() => setOrdersPipelineFilter(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* Text Search Box */}
                  <div style={{ width: "300px" }}>
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder="Search orders (name, phone, bill no)..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Orders Listing Grid Table */}
              <div className="glass-card" style={{ padding: "1.2rem" }}>
                {filteredPipelineOrders.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.15)", color: "var(--text-secondary)" }}>
                        <th style={{ padding: "0.8rem", width: "80px" }}>Bill No.</th>
                        <th style={{ padding: "0.8rem" }}>Customer</th>
                        <th style={{ padding: "0.8rem" }}>Garments</th>
                        <th style={{ padding: "0.8rem", width: "120px" }}>Booking Date</th>
                        <th style={{ padding: "0.8rem", width: "120px" }}>Delivery Date</th>
                        <th style={{ padding: "0.8rem", width: "150px" }}>Work Status</th>
                        <th style={{ padding: "0.8rem", textAlign: "center", width: "300px" }}>Actions / Alerts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPipelineOrders.map(o => (
                        <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.8rem", fontWeight: 700, color: "var(--color-gold-bright)" }}>#{o.id}</td>
                          <td style={{ padding: "0.8rem" }}>
                            <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{o.customerPhone}</div>
                          </td>
                          <td style={{ padding: "0.8rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            {o.items.map(item => `${item.name} (${item.qty})`).join(", ")}
                          </td>
                          <td style={{ padding: "0.8rem" }}>{o.bookingDate}</td>
                          <td style={{ padding: "0.8rem", fontWeight: 600 }}>{o.deliveryDate}</td>
                          <td style={{ padding: "0.8rem" }}>
                            <select
                              value={o.status}
                              onChange={e => handleUpdateOrderStatus(o.id, e.target.value as Order["status"])}
                              style={{
                                padding: "0.3rem 0.5rem",
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-gold)",
                                color: "white",
                                borderRadius: "4px",
                                fontSize: "0.8rem",
                                cursor: "pointer"
                              }}
                            >
                              <option value="Draft">Draft</option>
                              <option value="Stitching">Stitching</option>
                              <option value="Fitting">Fitting</option>
                              <option value="Ready">Ready</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                          <td style={{ padding: "0.8rem", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                                onClick={() => {
                                  setActiveInvoiceId(o.id);
                                  setActiveTab("invoices");
                                }}
                              >
                                View Bill
                              </button>

                              <button 
                                className="btn btn-primary" 
                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                                onClick={() => {
                                  const time = new Date().toLocaleTimeString("en-GB");
                                  const msg = o.status === "Ready" 
                                    ? `MATCHWEL: Hi ${o.customerName}, your stitching of the ${o.items.map(item => item.name.toLowerCase()).join(" and ")} (Bill No: #${o.id}) is ready! Just pick up from our store. - MATCHWEL TAILORS`
                                    : `MATCHWEL: Hi ${o.customerName}, status update for order #${o.id} is: ${o.status.toUpperCase()}. Target delivery: ${o.deliveryDate}.`;
                                  
                                  setCommsLog(log => [
                                    {
                                      id: "l" + (log.length + 1),
                                      time,
                                      type: "WhatsApp",
                                      recipient: o.customerName,
                                      message: msg,
                                      status: "Sent"
                                    },
                                    ...log
                                  ]);

                                  // Trigger WhatsApp web API link
                                  const cleanPhone = o.customerPhone.replace(/\D/g, "");
                                  const wpUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
                                  window.open(wpUrl, "_blank");
                                }}
                              >
                                WhatsApp Status
                              </button>

                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", background: "rgba(16,185,129,0.15)", color: "var(--success)" }}
                                onClick={() => {
                                  const time = new Date().toLocaleTimeString("en-GB");
                                  const msg = o.status === "Ready" 
                                    ? `MATCHWEL: Hi ${o.customerName}, your stitching of the ${o.items.map(item => item.name.toLowerCase()).join(" and ")} (Bill No: #${o.id}) is ready! Just pick up from our store. - MATCHWEL TAILORS`
                                    : `MATCHWEL Alert: Your order #${o.id} status is now ${o.status}. Delivery Date: ${o.deliveryDate}.`;
                                  
                                  setCommsLog(log => [
                                    {
                                      id: "l" + (log.length + 1),
                                      time,
                                      type: "SMS",
                                      recipient: o.customerName,
                                      message: msg,
                                      status: "Sent"
                                    },
                                    ...log
                                  ]);
                                  const cleanPhone = o.customerPhone.replace(/\D/g, "");
                                  window.open(`sms:${cleanPhone}?body=${encodeURIComponent(msg)}`, "_blank");
                                  alert(`SMS alert sent to ${o.customerName}!`);
                                }}
                              >
                                SMS Alert
                              </button>

                              <button 
                                className="btn btn-danger" 
                                style={{ padding: "0.3rem" }} 
                                onClick={() => handleDeleteOrder(o.id)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    No matching pipeline orders found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1c. Bespoke Delivery Calendar Page */}
          {activeTab === "calendar" && (() => {
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            
            // Generate monthly grid arrays
            const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
            const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
            
            const blankCells = Array.from({ length: firstDayIndex });
            const dayCells = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

            // Navigate month
            const prevMonth = () => {
              if (calendarMonth === 0) {
                setCalendarMonth(11);
                setCalendarYear(y => y - 1);
              } else {
                setCalendarMonth(m => m - 1);
              }
            };

            const nextMonth = () => {
              if (calendarMonth === 11) {
                setCalendarMonth(0);
                setCalendarYear(y => y + 1);
              } else {
                setCalendarMonth(m => m + 1);
              }
            };

            // Selected day orders filter
            const selectedDateOrders = orders.filter(o => o.deliveryDate === selectedCalendarDate);

            // Trigger Google Sync simulation
            const handleSyncGoogleCalendar = () => {
              const time = new Date().toLocaleTimeString("en-GB");
              // Find upcoming orders
              const upcoming = orders.filter(o => {
                const todayStr = new Date().toISOString().split("T")[0];
                return o.deliveryDate >= todayStr;
              });
              // Find expired synced orders to delete (simulated)
              const expiredCount = orders.filter(o => {
                const todayStr = new Date().toISOString().split("T")[0];
                return o.deliveryDate < todayStr;
              }).length;

              setGoogleSyncLogs(prev => [
                `[${time}] Pushed ${upcoming.length} upcoming delivery alerts to Google Calendar.`,
                `[${time}] Deleted ${expiredCount} past delivery notification events from Google Calendar.`,
                `[${time}] Sync completed successfully. Orders preserved locally.`,
                ...prev
              ]);
              alert("Google Calendar Sync executed successfully! Past events cleared, local history saved.");
            };

            return (
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
                
                {/* Left Side: Calendar Grid */}
                <div className="glass-card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ color: "var(--color-gold)", margin: 0, fontSize: "1.1rem" }}>
                      {months[calendarMonth]} {calendarYear}
                    </h3>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-secondary" style={{ padding: "0.4rem 0.6rem" }} onClick={prevMonth}>
                        <ChevronLeft size={16} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: "0.4rem 0.6rem" }} onClick={nextMonth}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Weekday headers */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.3rem", textAlign: "center", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>

                  {/* Grid cells */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.4rem" }}>
                    {blankCells.map((_, idx) => (
                      <div key={`blank-${idx}`} style={{ minHeight: "65px", background: "rgba(255,255,255,0.01)", borderRadius: "4px" }}></div>
                    ))}
                    {dayCells.map(day => {
                      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const dayOrders = orders.filter(o => o.deliveryDate === dateStr);
                      const isSelected = selectedCalendarDate === dateStr;
                      const isToday = new Date().toISOString().split("T")[0] === dateStr;

                      return (
                        <div 
                          key={day}
                          onClick={() => setSelectedCalendarDate(dateStr)}
                          style={{
                            minHeight: "65px",
                            padding: "0.4rem",
                            background: isSelected 
                              ? "rgba(207,168,81,0.25)" 
                              : isToday 
                              ? "rgba(255,255,255,0.08)" 
                              : "rgba(255,255,255,0.02)",
                            border: isSelected 
                              ? "1px solid var(--color-gold)" 
                              : isToday 
                              ? "1px dashed var(--border-gold-hover)" 
                              : "1px solid rgba(255,255,255,0.03)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: isToday ? "var(--color-gold-bright)" : "white" }}>{day}</span>
                          {dayOrders.length > 0 && (
                            <span style={{ 
                              background: "rgba(207,168,81,0.15)", 
                              color: "var(--color-gold-bright)", 
                              fontSize: "0.7rem", 
                              padding: "0.1rem 0.3rem", 
                              borderRadius: "4px",
                              fontWeight: 700,
                              textAlign: "center"
                            }}>
                              {dayOrders.length} Dlv.
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Date Detail & GCal Sync Panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  
                  {/* Selected Date Deliveries */}
                  <div className="glass-card" style={{ padding: "1.5rem" }}>
                    <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", marginBottom: "1rem" }}>
                      Deliveries on {selectedCalendarDate.split("-").reverse().join("/")}
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      {selectedDateOrders.map(o => (
                        <div key={o.id} style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{o.customerName}</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-gold-bright)", fontWeight: 700 }}>Bill No. #{o.id}</span>
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
                            Phone: {o.customerPhone} | Status: <span style={{ color: "var(--success)", fontWeight: 700 }}>{o.status}</span>
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                            Garments: {o.items.map(item => `${item.name} (${item.qty})`).join(", ")}
                          </div>
                          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.8rem" }}>
                            <button className="btn btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }} onClick={() => { setActiveInvoiceId(o.id); setActiveTab("invoices"); }}>View Bill</button>
                            <button className="btn btn-primary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }} onClick={() => alert(`Resent WhatsApp to ${o.customerName}!`)}>Notify Client</button>
                          </div>
                        </div>
                      ))}
                      {selectedDateOrders.length === 0 && (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem" }}>
                          No deliveries scheduled for this date.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Google Calendar Sync Control */}
                  <div className="glass-card" style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", margin: 0 }}>
                        Google Calendar Integration
                      </h3>
                      <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={handleSyncGoogleCalendar}>
                        <RefreshCw size={12} style={{ marginRight: 4 }} /> Sync Now
                      </button>
                    </div>

                    <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-gold)", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}>
                        <input 
                          type="checkbox" 
                          checked={googleSyncActive}
                          onChange={e => {
                            setGoogleSyncActive(e.target.checked);
                            if (e.target.checked) {
                              setGoogleSyncLogs(prev => [
                                `[${new Date().toLocaleTimeString("en-GB")}] Google API channel connected. Auto-cleanup enabled.`,
                                ...prev
                              ]);
                            }
                          }}
                        />
                        <span>Enable Auto Google Calendar Alerts</span>
                      </label>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
                        Pushes active delivery deadlines to your Google Calendar.
                      </p>
                    </div>

                    <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "6px", padding: "0.8rem", fontSize: "0.8rem", color: "var(--warning)" }}>
                      <strong>ℹ GCal Retention Rule:</strong> Past delivery calendar events are automatically pruned from Google Calendar 24h after completion to avoid cluttering your calendar. Local MATCHWEL invoice database remains fully preserved.
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Sync logs:</span>
                      <div style={{ maxHeight: "100px", overflowY: "auto", background: "rgba(0,0,0,0.3)", borderRadius: "4px", padding: "0.5rem", marginTop: "0.4rem", fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {googleSyncLogs.map((log, idx) => (
                          <div key={idx} style={{ color: log.includes("Deleted") ? "var(--warning)" : "var(--text-secondary)", marginBottom: "0.2rem" }}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            );
          })()}

          {/* 2. CRM Profiling */}
          {activeTab === "crm" && selectedCustomer && (
            <div className="crm-layout">
              <div className="customer-list-panel">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search clients..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <div className="customer-list">
                  {filteredCustomers.map(c => (
                    <div 
                      key={c.id} 
                      className={`customer-item ${selectedCustomerId === c.id ? "active" : ""}`}
                      onClick={() => setSelectedCustomerId(c.id)}
                    >
                      <h4>{c.name}</h4>
                      <p>{c.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className="glass-card">
                  <div className="measurement-sheet-header">
                    <div style={{ flexGrow: 1 }}>
                      {isEditingDemographics ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", maxWidth: "400px" }}>
                          <input type="text" className="search-input" style={{ padding: "0.5rem" }} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Client Name" />
                          <input type="text" className="search-input" style={{ padding: "0.5rem" }} value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Phone" />
                          <input type="email" className="search-input" style={{ padding: "0.5rem" }} value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email" />
                          <input type="text" className="search-input" style={{ padding: "0.5rem" }} value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="Address" />
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                            <button className="btn btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={handleSaveDemographics}>Save Details</button>
                            <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={() => setIsEditingDemographics(false)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h2 style={{ fontSize: "1.6rem", fontFamily: "var(--font-serif)", color: "var(--color-gold-bright)" }}>{selectedCustomer.name}</h2>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.3rem" }}>Phone: {selectedCustomer.phone} | Email: {selectedCustomer.email}</p>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}><MapPin size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{selectedCustomer.address}</p>
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
                            <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={() => startEditDemographics(selectedCustomer)}>Edit Profile Details</button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} 
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete the profile, measurements, and logs for ${selectedCustomer.name}?`)) {
                                  const remaining = customers.filter(c => c.id !== selectedCustomer.id);
                                  setCustomers(remaining);
                                  if (remaining.length > 0) {
                                    setSelectedCustomerId(remaining[0].id);
                                  }
                                }
                              }}
                            >
                              Delete Customer Profile
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", marginBottom: "1rem", fontSize: "0.9rem" }}>Stitching & Billing History</h3>
                  {customerOrdersHistory.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.15)", color: "var(--text-secondary)" }}>
                          <th style={{ padding: "0.6rem" }}>Bill No.</th>
                          <th style={{ padding: "0.6rem" }}>Booking Date</th>
                          <th style={{ padding: "0.6rem" }}>Delivery Date</th>
                          <th style={{ padding: "0.6rem" }}>Items</th>
                          <th style={{ padding: "0.6rem", textAlign: "right" }}>Total Bill</th>
                          <th style={{ padding: "0.6rem", textAlign: "center" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerOrdersHistory.map(o => (
                          <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.6rem", fontWeight: 600 }}>#{o.id}</td>
                            <td style={{ padding: "0.6rem" }}>{o.bookingDate}</td>
                            <td style={{ padding: "0.6rem" }}>{o.deliveryDate}</td>
                            <td style={{ padding: "0.6rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{o.items.map(item => `${item.name} (${item.qty})`).join(", ")}</td>
                            <td style={{ padding: "0.6rem", textAlign: "right", color: "var(--color-gold-bright)", fontWeight: 700 }}>₹{calculateTotal(o)}</td>
                            <td style={{ padding: "0.6rem", textAlign: "center" }}>
                              <button className="btn btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }} onClick={() => { setActiveInvoiceId(o.id); setActiveTab("invoices"); }}>View Bill</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No previous bills registered.</p>
                  )}
                </div>

                <div className="glass-card">
                  <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", marginBottom: "1rem", fontSize: "0.9rem" }}>Customer Measurements Book</h3>
                  <div className="garment-tabs">
                    {(["shirt", "pant", "kurta", "safari", "blazer", "sherwani", "jacket"] as const).map(cat => (
                      <button key={cat} className={`garment-tab ${crmMeasurementCategory === cat ? "active" : ""}`} onClick={() => setCrmMeasurementCategory(cat)} style={{ textTransform: "capitalize" }}>{cat}</button>
                    ))}
                  </div>

                  <div className="paper-form-card">
                    <div className="paper-input-grid">
                      {crmMeasurementCategory === "shirt" && (
                        <>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.shirt.length} onChange={e => handleCrmMeasurementFieldChange("length", e.target.value)} /><span className="paper-input-label">उंची</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.shirt.chest} onChange={e => handleCrmMeasurementFieldChange("chest", e.target.value)} /><span className="paper-input-label">छाती</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.shirt.waist} onChange={e => handleCrmMeasurementFieldChange("waist", e.target.value)} /><span className="paper-input-label">पोट</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.shirt.seat} onChange={e => handleCrmMeasurementFieldChange("seat", e.target.value)} /><span className="paper-input-label">शिट</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.shirt.shoulder} onChange={e => handleCrmMeasurementFieldChange("shoulder", e.target.value)} /><span className="paper-input-label">शोल्डर</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.shirt.sleeve} onChange={e => handleCrmMeasurementFieldChange("sleeve", e.target.value)} /><span className="paper-input-label">बाही</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.shirt.collar} onChange={e => handleCrmMeasurementFieldChange("collar", e.target.value)} /><span className="paper-input-label">कॉलर</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.shirt.cuff} onChange={e => handleCrmMeasurementFieldChange("cuff", e.target.value)} /><span className="paper-input-label">कफ</span></div>
                          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem", marginTop: "1rem", color: "#000", fontWeight: 700, fontSize: "0.85rem" }}>
                            <label><input type="checkbox" checked={selectedCustomer.measurements.shirt.pocket} onChange={e => handleCrmMeasurementFieldChange("pocket", e.target.checked)} /> Pocket</label>
                            <label><input type="checkbox" checked={selectedCustomer.measurements.shirt.manela} onChange={e => handleCrmMeasurementFieldChange("manela", e.target.checked)} /> Manela</label>
                            <label><input type="checkbox" checked={selectedCustomer.measurements.shirt.apple} onChange={e => handleCrmMeasurementFieldChange("apple", e.target.checked)} /> Apple</label>
                            <label><input type="checkbox" checked={selectedCustomer.measurements.shirt.sideCut} onChange={e => handleCrmMeasurementFieldChange("sideCut", e.target.checked)} /> Side Cut</label>
                          </div>
                        </>
                      )}

                      {crmMeasurementCategory === "pant" && (
                        <>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.pant.length} onChange={e => handleCrmMeasurementFieldChange("length", e.target.value)} /><span className="paper-input-label">उंची</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.pant.waist} onChange={e => handleCrmMeasurementFieldChange("waist", e.target.value)} /><span className="paper-input-label">कंबर</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.pant.seat} onChange={e => handleCrmMeasurementFieldChange("seat", e.target.value)} /><span className="paper-input-label">सीट</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.pant.knee} onChange={e => handleCrmMeasurementFieldChange("knee", e.target.value)} /><span className="paper-input-label">गुडघा</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.pant.bottom} onChange={e => handleCrmMeasurementFieldChange("bottom", e.target.value)} /><span className="paper-input-label">बॉटम</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.pant.thigh} onChange={e => handleCrmMeasurementFieldChange("thigh", e.target.value)} /><span className="paper-input-label">मांडी</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.pant.inseam} onChange={e => handleCrmMeasurementFieldChange("inseam", e.target.value)} /><span className="paper-input-label">अंदर</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.pant.front} onChange={e => handleCrmMeasurementFieldChange("front", e.target.value)} /><span className="paper-input-label">फ्रंट</span></div>
                          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem", marginTop: "1rem", color: "#000", fontWeight: 700, fontSize: "0.85rem" }}>
                            <label><input type="checkbox" checked={selectedCustomer.measurements.pant.tight} onChange={e => { handleCrmMeasurementFieldChange("tight", e.target.checked); if (e.target.checked) handleCrmMeasurementFieldChange("loose", false); }} /> Tight Fit</label>
                            <label><input type="checkbox" checked={selectedCustomer.measurements.pant.loose} onChange={e => { handleCrmMeasurementFieldChange("loose", e.target.checked); if (e.target.checked) handleCrmMeasurementFieldChange("tight", false); }} /> Loose Fit</label>
                          </div>
                        </>
                      )}

                      {crmMeasurementCategory === "kurta" && (
                        <>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.kurta.length} onChange={e => handleCrmMeasurementFieldChange("length", e.target.value)} /><span className="paper-input-label">Length</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.kurta.chest} onChange={e => handleCrmMeasurementFieldChange("chest", e.target.value)} /><span className="paper-input-label">Chest</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.kurta.waist} onChange={e => handleCrmMeasurementFieldChange("waist", e.target.value)} /><span className="paper-input-label">Waist</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.kurta.seat} onChange={e => handleCrmMeasurementFieldChange("seat", e.target.value)} /><span className="paper-input-label">Seat</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.kurta.shoulder} onChange={e => handleCrmMeasurementFieldChange("shoulder", e.target.value)} /><span className="paper-input-label">Shoulder</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.kurta.sleeve} onChange={e => handleCrmMeasurementFieldChange("sleeve", e.target.value)} /><span className="paper-input-label">Sleeve</span></div>
                          <div className="paper-input-cell" style={{ gridColumn: "span 2" }}><input type="text" className="paper-input-field" value={selectedCustomer.measurements.kurta.collar} onChange={e => handleCrmMeasurementFieldChange("collar", e.target.value)} /><span className="paper-input-label">Collar</span></div>
                        </>
                      )}

                      {crmMeasurementCategory === "safari" && (
                        <>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.safari.length} onChange={e => handleCrmMeasurementFieldChange("length", e.target.value)} /><span className="paper-input-label">Length</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.safari.chest} onChange={e => handleCrmMeasurementFieldChange("chest", e.target.value)} /><span className="paper-input-label">Chest</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.safari.waist} onChange={e => handleCrmMeasurementFieldChange("waist", e.target.value)} /><span className="paper-input-label">Waist</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.safari.seat} onChange={e => handleCrmMeasurementFieldChange("seat", e.target.value)} /><span className="paper-input-label">Seat</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.safari.shoulder} onChange={e => handleCrmMeasurementFieldChange("shoulder", e.target.value)} /><span className="paper-input-label">Shoulder</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.safari.sleeve} onChange={e => handleCrmMeasurementFieldChange("sleeve", e.target.value)} /><span className="paper-input-label">Sleeve</span></div>
                          <div className="paper-input-cell" style={{ gridColumn: "span 2" }}><input type="text" className="paper-input-field" value={selectedCustomer.measurements.safari.collar} onChange={e => handleCrmMeasurementFieldChange("collar", e.target.value)} /><span className="paper-input-label">Collar</span></div>
                        </>
                      )}

                      {crmMeasurementCategory === "blazer" && (
                        <>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.blazer.length} onChange={e => handleCrmMeasurementFieldChange("length", e.target.value)} /><span className="paper-input-label">Length</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.blazer.chest} onChange={e => handleCrmMeasurementFieldChange("chest", e.target.value)} /><span className="paper-input-label">Chest</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.blazer.waist} onChange={e => handleCrmMeasurementFieldChange("waist", e.target.value)} /><span className="paper-input-label">Waist</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.blazer.seat} onChange={e => handleCrmMeasurementFieldChange("seat", e.target.value)} /><span className="paper-input-label">Seat</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.blazer.shoulder} onChange={e => handleCrmMeasurementFieldChange("shoulder", e.target.value)} /><span className="paper-input-label">Shoulder</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.blazer.sleeve} onChange={e => handleCrmMeasurementFieldChange("sleeve", e.target.value)} /><span className="paper-input-label">Sleeve</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.blazer.lapel} onChange={e => handleCrmMeasurementFieldChange("lapel", e.target.value)} /><span className="paper-input-label">Lapel</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.blazer.acrossBack} onChange={e => handleCrmMeasurementFieldChange("acrossBack", e.target.value)} /><span className="paper-input-label">Across Back</span></div>
                        </>
                      )}

                      {crmMeasurementCategory === "sherwani" && (
                        <>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.sherwani.length} onChange={e => handleCrmMeasurementFieldChange("length", e.target.value)} /><span className="paper-input-label">Length</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.sherwani.chest} onChange={e => handleCrmMeasurementFieldChange("chest", e.target.value)} /><span className="paper-input-label">Chest</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.sherwani.waist} onChange={e => handleCrmMeasurementFieldChange("waist", e.target.value)} /><span className="paper-input-label">Waist</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.sherwani.seat} onChange={e => handleCrmMeasurementFieldChange("seat", e.target.value)} /><span className="paper-input-label">Seat</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.sherwani.shoulder} onChange={e => handleCrmMeasurementFieldChange("shoulder", e.target.value)} /><span className="paper-input-label">Shoulder</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.sherwani.sleeve} onChange={e => handleCrmMeasurementFieldChange("sleeve", e.target.value)} /><span className="paper-input-label">Sleeve</span></div>
                          <div className="paper-input-cell" style={{ gridColumn: "span 2" }}><input type="text" className="paper-input-field" value={selectedCustomer.measurements.sherwani.collar} onChange={e => handleCrmMeasurementFieldChange("collar", e.target.value)} /><span className="paper-input-label">Collar</span></div>
                        </>
                      )}

                      {crmMeasurementCategory === "jacket" && (
                        <>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.jacket.length} onChange={e => handleCrmMeasurementFieldChange("length", e.target.value)} /><span className="paper-input-label">Length</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.jacket.chest} onChange={e => handleCrmMeasurementFieldChange("chest", e.target.value)} /><span className="paper-input-label">Chest</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.jacket.waist} onChange={e => handleCrmMeasurementFieldChange("waist", e.target.value)} /><span className="paper-input-label">Waist</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.jacket.seat} onChange={e => handleCrmMeasurementFieldChange("seat", e.target.value)} /><span className="paper-input-label">Seat</span></div>
                          <div className="paper-input-cell"><input type="text" className="paper-input-field" value={selectedCustomer.measurements.jacket.shoulder} onChange={e => handleCrmMeasurementFieldChange("shoulder", e.target.value)} /><span className="paper-input-label">Shoulder</span></div>
                          <div className="paper-input-cell" style={{ gridColumn: "span 3" }}><input type="text" className="paper-input-field" value={selectedCustomer.measurements.jacket.sleeve} onChange={e => handleCrmMeasurementFieldChange("sleeve", e.target.value)} /><span className="paper-input-label">Sleeve</span></div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Measurements auto-save instantly.</span>
                    <button className="btn btn-primary" onClick={() => alert("Measurements saved successfully!")}>Save Changes</button>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* 3. Invoices */}
            {activeTab === "invoices" && (
              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem" }}>
                <div className="glass-card" style={{ padding: "1.2rem" }}>
                  <h3 className="brand-subtitle" style={{ marginBottom: "0.8rem", color: "var(--color-gold)" }}>Active Bills</h3>
                  
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search Bill No. or client..."
                    style={{ marginBottom: "1rem", padding: "0.5rem 0.8rem", fontSize: "0.85rem" }}
                    value={invoiceSearchQuery}
                    onChange={e => setInvoiceSearchQuery(e.target.value)}
                  />

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "60vh", overflowY: "auto" }}>
                    {filteredInvoiceOrders.map(o => (
                      <div 
                        key={o.id}
                        style={{
                          padding: "0.8rem",
                          borderRadius: "6px",
                          background: activeInvoiceId === o.id ? "rgba(207,168,81,0.15)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${activeInvoiceId === o.id ? "var(--color-gold)" : "rgba(255,255,255,0.05)"}`,
                          cursor: "pointer"
                        }}
                        onClick={() => setActiveInvoiceId(o.id)}
                      >
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{o.customerName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Bill No: {o.id} | Total: ₹{calculateTotal(o)}</div>
                      </div>
                    ))}
                    {filteredInvoiceOrders.length === 0 && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>
                        No bills match.
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card" style={{ background: "rgba(25,27,38,0.5)" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                      <Download size={16} /> Print MATCHWEL Bill Receipt
                    </button>
                  </div>

                  {selectedInvoiceOrder ? (
                    <div className="paper-invoice">
                      <div className="paper-header">
                        <div className="paper-brand-area">
                          <div className="paper-brand-main">Custom Tailoring</div>
                          <div className="paper-brand-sub">MATCHWEL TAILORS</div>
                        </div>
                        <div className="paper-master-box">
                          <div className="paper-master-title">MASTER</div>
                          <div className="paper-master-phone">7028331155</div>
                        </div>
                        <div className="paper-bill-no-box">
                          <div className="paper-bill-title">Bill No.:</div>
                          <div className="paper-bill-no">{selectedInvoiceOrder.id}</div>
                        </div>
                      </div>

                      <div className="paper-meta-row">
                        <div className="paper-meta-item"><span className="label">Cust. Name:</span><span className="value">{selectedInvoiceOrder.customerName}</span></div>
                        <div className="paper-meta-item"><span className="label">Mob. No.:</span><span className="value">{selectedInvoiceOrder.customerPhone}</span></div>
                        <div className="paper-meta-item"><span className="label">Date:</span><span className="value">{selectedInvoiceOrder.bookingDate}</span></div>
                        <div className="paper-meta-item"><span className="label">Delivery Date:</span><span className="value" style={{ fontWeight: 800 }}>{selectedInvoiceOrder.deliveryDate}</span></div>
                      </div>

                      <table className="paper-table">
                        <thead>
                          <tr>
                            <th style={{ width: "50px", textAlign: "center" }}>No.</th>
                            <th>Description</th>
                            <th style={{ width: "80px", textAlign: "center" }}>Qty.</th>
                            <th style={{ width: "100px", textAlign: "right" }}>Rate (₹)</th>
                            <th style={{ width: "120px", textAlign: "right" }}>Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoiceOrder.items.map((item, index) => (
                            <tr key={item.name}>
                              <td style={{ textAlign: "center" }}>{index + 1}</td>
                              <td style={{ fontWeight: "700" }}>{item.name}</td>
                              <td style={{ textAlign: "center" }}>{item.qty}</td>
                              <td style={{ textAlign: "right" }}>{item.rate}</td>
                              <td style={{ textAlign: "right", fontWeight: "700" }}>₹{item.qty * item.rate}</td>
                            </tr>
                          ))}
                          <tr className="total-row">
                            <td colSpan={4} style={{ textAlign: "right", fontWeight: "800" }}>Total Amount -</td>
                            <td style={{ textAlign: "right", fontWeight: "800" }}>₹{calculateTotal(selectedInvoiceOrder)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.85rem", fontWeight: "700" }}>
                        <div>Working Hours: 10 a.m. To 8 p.m.</div>
                        <div style={{ borderTop: "1px solid #000", width: "150px", textAlign: "center", marginTop: "1rem" }}>Sign.</div>
                      </div>

                      <div className="paper-measurements-section">
                        <div className="paper-measure-box">
                          <div className="paper-measure-title">
                            <span>PANT (पैंट) MEASUREMENTS</span>
                            <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>Fit: {invoiceCustomer.measurements.pant.tight ? "फिट ✓ " : ""}{invoiceCustomer.measurements.pant.loose ? "लूस ✓" : ""}</span>
                          </div>
                          <div className="paper-measure-grid">
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">उंची</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.length}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">कंबर</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.waist}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">सीट</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.seat}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">गुडघा</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.knee}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">बॉटम</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.bottom}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">मांडी</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.thigh}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">अंदर</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.inseam}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">फ्रंट</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.pant.front}</span></div>
                          </div>
                        </div>

                        <div className="paper-measure-box">
                          <div className="paper-measure-title">
                            <span>SHIRT (शर्ट) MEASUREMENTS</span>
                            <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>Options: {invoiceCustomer.measurements.shirt.pocket ? "पॉकेट ✓ " : ""}{invoiceCustomer.measurements.shirt.manela ? "मनेला ✓ " : ""}{invoiceCustomer.measurements.shirt.apple ? "ॲपल ✓ " : ""}{invoiceCustomer.measurements.shirt.sideCut ? "साईड कट ✓" : ""}</span>
                          </div>
                          <div className="paper-measure-grid">
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">उंची</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.length}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">छाती</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.chest}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">पोट</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.waist}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">शिट</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.seat}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">शोल्डर</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.shoulder}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">बाही</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.sleeve}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">कॉलर</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.collar}</span></div>
                            <div className="paper-measure-cell"><span className="paper-measure-cell-label">कफ</span><span className="paper-measure-cell-value">{invoiceCustomer.measurements.shirt.cuff}</span></div>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#666", marginTop: "1rem", borderTop: "1px dashed #aaa", paddingTop: "0.5rem" }}>Thank You... Visit Again</div>
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "3rem" }}>Please select or create an active order billing account.</div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Comms */}
            {activeTab === "comms" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>
                <div className="glass-card">
                  
                  {/* Comms Filters Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "1rem" }}>
                    <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", margin: 0, fontSize: "0.95rem" }}>Dispatch Notification Simulator</h3>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button 
                        className={`btn ${commsDeliveryFilter === "today" ? "btn-primary" : "btn-secondary"}`}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                        onClick={() => setCommsDeliveryFilter("today")}
                      >
                        Today's Deliveries
                      </button>
                      <button 
                        className={`btn ${commsDeliveryFilter === "all" ? "btn-primary" : "btn-secondary"}`}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                        onClick={() => setCommsDeliveryFilter("all")}
                      >
                        All Deliveries
                      </button>
                    </div>
                  </div>

                  {/* Sender Config Input */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-gold)", borderRadius: "8px", padding: "0.8rem", marginBottom: "1.2rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-gold-bright)" }}>
                      Sender WhatsApp No:
                    </span>
                    <input 
                      type="text" 
                      className="search-input" 
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", width: "160px", margin: 0 }}
                      value={whatsappSenderNum}
                      onChange={e => setWhatsappSenderNum(e.target.value)}
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      (Recipient Defaults to Customer Phone Number)
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {orders
                      .filter(o => {
                        if (commsDeliveryFilter === "today") {
                          const todayStr = new Date().toISOString().split("T")[0];
                          return o.deliveryDate === todayStr;
                        }
                        return true;
                      })
                      .map(o => (
                        <div key={o.id} style={{ padding: "1.2rem", borderRadius: "8px", background: "rgba(25, 27, 38, 0.4)", border: "1px solid rgba(212, 175, 55, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{o.customerName} (Bill No: {o.id})</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Delivery: <span style={{ color: "var(--color-gold-bright)" }}>{o.deliveryDate}</span></div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>To: {o.customerPhone}</div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }} 
                              onClick={() => {
                                const time = new Date().toLocaleTimeString("en-GB");
                                const msg = `MATCHWEL: Hi ${o.customerName}, your stitching of the ${o.items.map(item => item.name.toLowerCase()).join(" and ")} (Bill No: #${o.id}) is ready! Just pick up from our store. - MATCHWEL TAILORS`;
                                setCommsLog(log => [{ id: "l" + (log.length + 1), time, type: "WhatsApp", recipient: `${o.customerName} (${o.customerPhone})`, message: msg, status: "Sent" }, ...log]);
                                
                                // Open WhatsApp API Web Link
                                const cleanPhone = o.customerPhone.replace(/\D/g, "");
                                const wpUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
                                window.open(wpUrl, "_blank");
                              }}
                            >
                              WhatsApp
                            </button>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }} 
                              onClick={() => {
                                const time = new Date().toLocaleTimeString("en-GB");
                                const msg = `MATCHWEL: Hi ${o.customerName}, your stitching of the ${o.items.map(item => item.name.toLowerCase()).join(" and ")} (Bill No: #${o.id}) is ready! Just pick up from our store. - MATCHWEL TAILORS`;
                                setCommsLog(log => [{ id: "l" + (log.length + 1), time, type: "SMS", recipient: o.customerName, message: msg, status: "Sent" }, ...log]);
                                const cleanPhone = o.customerPhone.replace(/\D/g, "");
                                window.open(`sms:${cleanPhone}?body=${encodeURIComponent(msg)}`, "_blank");
                                alert(`SMS notification dispatched to ${o.customerPhone}!`);
                              }}
                            >
                              SMS Alert
                            </button>
                          </div>
                        </div>
                      ))}

                    {orders.filter(o => {
                      if (commsDeliveryFilter === "today") {
                        const todayStr = new Date().toISOString().split("T")[0];
                        return o.deliveryDate === todayStr;
                      }
                      return true;
                    }).length === 0 && (
                      <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>
                        No deliveries match filter criteria.
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card">
                  <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", marginBottom: "1.2rem", fontSize: "0.9rem" }}>Gateways Dispatch Logs</h3>
                  <div className="log-panel">
                    {commsLog.map(log => (
                      <div key={log.id} className="log-entry">
                        <div className="log-time">[{log.time}] {log.type} to {log.recipient}</div>
                        <div className="log-text">{log.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Backup / Sync Data Hub (CSV) */}
            {activeTab === "backup" && (() => {
              // CSV Export functions
              const exportCustomersCSV = () => {
                let csv = "Name,Phone,Email,Address," +
                  "Shirt_Length,Shirt_Chest,Shirt_Waist,Shirt_Seat,Shirt_Shoulder,Shirt_Sleeve,Shirt_Collar,Shirt_Cuff,Shirt_Pocket,Shirt_Manela,Shirt_Apple,Shirt_SideCut," +
                  "Pant_Length,Pant_Waist,Pant_Seat,Pant_Knee,Pant_Bottom,Pant_Thigh,Pant_Inseam,Pant_Front,Pant_Tight,Pant_Loose\n";

                customers.forEach(c => {
                  const row = [
                    `"${c.name.replace(/"/g, '""')}"`,
                    `"${c.phone}"`,
                    `"${c.email}"`,
                    `"${c.address.replace(/"/g, '""')}"`,
                    c.measurements.shirt.length || "0",
                    c.measurements.shirt.chest || "0",
                    c.measurements.shirt.waist || "0",
                    c.measurements.shirt.seat || "0",
                    c.measurements.shirt.shoulder || "0",
                    c.measurements.shirt.sleeve || "0",
                    c.measurements.shirt.collar || "0",
                    c.measurements.shirt.cuff || "0",
                    c.measurements.shirt.pocket ? "1" : "0",
                    c.measurements.shirt.manela ? "1" : "0",
                    c.measurements.shirt.apple ? "1" : "0",
                    c.measurements.shirt.sideCut ? "1" : "0",
                    c.measurements.pant.length || "0",
                    c.measurements.pant.waist || "0",
                    c.measurements.pant.seat || "0",
                    c.measurements.pant.knee || "0",
                    c.measurements.pant.bottom || "0",
                    c.measurements.pant.thigh || "0",
                    c.measurements.pant.inseam || "0",
                    c.measurements.pant.front || "0",
                    c.measurements.pant.tight ? "1" : "0",
                    c.measurements.pant.loose ? "1" : "0"
                  ];
                  csv += row.join(",") + "\n";
                });

                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `matchwel_customers_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              };

              const exportOrdersCSV = () => {
                let csv = "Bill_No,Customer_Phone,Customer_Name,Booking_Date,Delivery_Date,Items_List,Status,Notes\n";
                orders.forEach(o => {
                  const itemsStr = o.items.map(item => `${item.name}:${item.qty}:${item.rate}`).join("|");
                  const row = [
                    o.id,
                    `"${o.customerPhone}"`,
                    `"${o.customerName.replace(/"/g, '""')}"`,
                    o.bookingDate,
                    o.deliveryDate,
                    `"${itemsStr}"`,
                    o.status,
                    `"${o.notes.replace(/"/g, '""')}"`
                  ];
                  csv += row.join(",") + "\n";
                });

                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `matchwel_orders_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              };

              // CSV Import Handlers
              const handleImportCustomers = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (evt) => {
                  const text = evt.target?.result as string;
                  if (!text) return;

                  try {
                    const lines = text.split("\n");
                    const importedCusts: Customer[] = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                      const line = lines[i].trim();
                      if (!line) continue;

                      // Parse CSV line handling quotes
                      const cols: string[] = [];
                      let current = "";
                      let inQuotes = false;
                      for (let j = 0; j < line.length; j++) {
                        const char = line[j];
                        if (char === '"') {
                          inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                          cols.push(current.trim());
                          current = "";
                        } else {
                          current += char;
                        }
                      }
                      cols.push(current.trim());

                      if (cols.length < 4) continue;

                      const [name, phone, email, address] = cols;
                      const shirtLength = cols[4] || "";
                      const shirtChest = cols[5] || "";
                      const shirtWaist = cols[6] || "";
                      const shirtSeat = cols[7] || "";
                      const shirtShoulder = cols[8] || "";
                      const shirtSleeve = cols[9] || "";
                      const shirtCollar = cols[10] || "";
                      const shirtCuff = cols[11] || "";
                      const shirtPocket = cols[12] === "1";
                      const shirtManela = cols[13] === "1";
                      const shirtApple = cols[14] === "1";
                      const shirtSideCut = cols[15] === "1";

                      const pantLength = cols[16] || "";
                      const pantWaist = cols[17] || "";
                      const pantSeat = cols[18] || "";
                      const pantKnee = cols[19] || "";
                      const pantBottom = cols[20] || "";
                      const pantThigh = cols[21] || "";
                      const pantInseam = cols[22] || "";
                      const pantFront = cols[23] || "";
                      const pantTight = cols[24] === "1";
                      const pantLoose = cols[25] === "1";

                      importedCusts.push({
                        id: "c" + (customers.length + importedCusts.length + 1),
                        name,
                        phone,
                        email,
                        address,
                        measurements: {
                          shirt: { length: shirtLength, chest: shirtChest, waist: shirtWaist, seat: shirtSeat, shoulder: shirtShoulder, sleeve: shirtSleeve, collar: shirtCollar, cuff: shirtCuff, pocket: shirtPocket, manela: shirtManela, apple: shirtApple, sideCut: shirtSideCut },
                          pant: { length: pantLength, waist: pantWaist, seat: pantSeat, knee: pantKnee, bottom: pantBottom, thigh: pantThigh, inseam: pantInseam, front: pantFront, tight: pantTight, loose: pantLoose },
                          kurta: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "", collar: "" },
                          safari: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "", collar: "" },
                          blazer: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "", lapel: "", acrossBack: "" },
                          sherwani: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "", collar: "" },
                          jacket: { length: "", chest: "", waist: "", seat: "", shoulder: "", sleeve: "" }
                        }
                      });
                    }

                    if (importedCusts.length > 0) {
                      setCustomers(prev => {
                        // Avoid duplicates by phone number
                        const filteredPrev = prev.filter(c => !importedCusts.some(ic => ic.phone === c.phone));
                        return [...filteredPrev, ...importedCusts];
                      });
                      alert(`Successfully imported ${importedCusts.length} clients!`);
                    } else {
                      alert("No valid client rows found in CSV.");
                    }
                  } catch (err) {
                    alert("Failed to parse CSV. Please verify formatting.");
                  }
                };
                reader.readAsText(file);
              };

              const handleImportOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (evt) => {
                  const text = evt.target?.result as string;
                  if (!text) return;

                  try {
                    const lines = text.split("\n");
                    const importedOrders: Order[] = [];

                    for (let i = 1; i < lines.length; i++) {
                      const line = lines[i].trim();
                      if (!line) continue;

                      // Parse CSV line handling quotes
                      const cols: string[] = [];
                      let current = "";
                      let inQuotes = false;
                      for (let j = 0; j < line.length; j++) {
                        const char = line[j];
                        if (char === '"') {
                          inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                          cols.push(current.trim());
                          current = "";
                        } else {
                          current += char;
                        }
                      }
                      cols.push(current.trim());

                      if (cols.length < 5) continue;

                      const [billNo, phone, name, booking, delivery, itemsList, status, notes] = cols;
                      
                      // Parse items back from format "SHIRT:2:500|PANT:1:600"
                      const items: OrderItem[] = (itemsList || "").split("|").map(chunk => {
                        const [itemName, qty, rate] = chunk.split(":");
                        return {
                          name: itemName || "SHIRT",
                          qty: Number(qty) || 0,
                          rate: Number(rate) || 500
                        };
                      }).filter(item => item.qty > 0);

                      importedOrders.push({
                        id: billNo,
                        customerId: "imported",
                        customerName: name,
                        customerPhone: phone,
                        bookingDate: booking,
                        deliveryDate: delivery,
                        items,
                        status: (status as Order["status"]) || "Draft",
                        notes: notes || ""
                      });
                    }

                    if (importedOrders.length > 0) {
                      setOrders(prev => {
                        // Avoid duplicates by bill no
                        const filteredPrev = prev.filter(o => !importedOrders.some(io => io.id === o.id));
                        return [...filteredPrev, ...importedOrders];
                      });
                      alert(`Successfully imported ${importedOrders.length} orders!`);
                    } else {
                      alert("No valid order rows found in CSV.");
                    }
                  } catch (err) {
                    alert("Failed to parse CSV. Please verify formatting.");
                  }
                };
                reader.readAsText(file);
              };

              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                  
                  {/* Left Column: Export Hub */}
                  <div className="glass-card" style={{ padding: "2rem" }}>
                    <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", marginBottom: "1.5rem", fontSize: "1rem" }}>
                      Backup Data Export (CSV)
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: "1.5" }}>
                      Export all custom measurements, customer contact folders, and order delivery calendar histories into standard CSV files. You can save these files on a USB drive to migrate system states to a new computer easily.
                    </p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <button className="btn btn-primary" style={{ justifyContent: "center", width: "100%", padding: "1rem" }} onClick={exportCustomersCSV}>
                        Export Customers & Measurements Book
                      </button>
                      <button className="btn btn-secondary" style={{ justifyContent: "center", width: "100%", padding: "1rem" }} onClick={exportOrdersCSV}>
                        Export Stitching Orders & Billing History
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Import Hub */}
                  <div className="glass-card" style={{ padding: "2rem" }}>
                    <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", marginBottom: "1.5rem", fontSize: "1rem" }}>
                      Backup Data Import (CSV)
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: "1.5" }}>
                      Choose your exported CSV data files below to import customers, physical measurements, and order logs onto this computer.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      
                      {/* Customer Import File Upload Box */}
                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-gold)", borderRadius: "8px", padding: "1.2rem" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-gold-bright)", display: "block", marginBottom: "0.5rem" }}>
                          Import Customers & Measurements:
                        </span>
                        <input 
                          type="file" 
                          accept=".csv"
                          onChange={handleImportCustomers}
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                        />
                      </div>

                      {/* Orders Import File Upload Box */}
                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-gold)", borderRadius: "8px", padding: "1.2rem" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-gold-bright)", display: "block", marginBottom: "0.5rem" }}>
                          Import Orders & Billing Logs:
                        </span>
                        <input 
                          type="file" 
                          accept=".csv"
                          onChange={handleImportOrders}
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Third Column: Factory Reset */}
                  <div className="glass-card" style={{ padding: "2rem", border: "1px solid rgba(239, 68, 68, 0.3)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3 className="brand-subtitle" style={{ color: "var(--danger)", marginBottom: "1.5rem", fontSize: "1rem" }}>
                        System Factory Reset
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: "1.5" }}>
                        WARNING: This action will permanently erase all customers, physical measurements, order pipelines, invoice transaction logs, and communication logs. The app will restart completely clean.
                      </p>
                    </div>

                    <div>
                      <button 
                        className="btn btn-danger" 
                        style={{ justifyContent: "center", width: "100%", padding: "1rem", fontWeight: 700 }}
                        onClick={() => {
                          if (confirm("WARNING: Are you absolutely sure you want to trigger a full system factory reset? ALL data will be permanently lost!")) {
                            if (confirm("FINAL CONFIRMATION: Double check if you have exported backups. Wiping the database now... Proceed?")) {
                              localStorage.setItem("matchwel_customers", JSON.stringify([]));
                              localStorage.setItem("matchwel_orders", JSON.stringify([]));
                              localStorage.setItem("matchwel_comms_log", JSON.stringify([]));
                              localStorage.setItem("matchwel_initialized", "false");
                              setCustomers([]);
                              setOrders([]);
                              setCommsLog([]);
                              alert("System successfully reset to factory defaults. Restarting application...");
                              window.location.reload();
                            }
                          }
                        }}
                      >
                        Perform Factory Reset
                      </button>
                    </div>
                  </div>

                </div>
              );
            })()}
          </main>
        </div>

      {/* A. Wide Customer and Measurement Registration Modal */}
      {showAddCustomerModal && (
        <div className="overlay">
          <div className="modal-content-wide">
            <div className="measurement-sheet-header">
              <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--color-gold)" }}>New custom Stitching Bill</h2>
              <button className="btn btn-danger" style={{ padding: "0.4rem 1rem" }} onClick={() => setShowAddCustomerModal(false)}>Close</button>
            </div>

            <form onSubmit={handleSaveAndPrint} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr", gap: "1rem" }}>
                <div className="measurement-field" style={{ alignItems: "stretch", textAlign: "left" }}>
                  <label>Mobile / Phone *</label>
                  <input type="text" required value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="Type number..." />
                  {isExistingClient && <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600, marginTop: "0.2rem" }}>✓ Existing Client: Loaded</span>}
                </div>
                <div className="measurement-field" style={{ alignItems: "stretch", textAlign: "left" }}>
                  <label>Customer Name *</label>
                  <input type="text" required value={custName} onChange={e => setCustName(e.target.value)} placeholder="Full Name" />
                </div>
                <div className="measurement-field" style={{ alignItems: "stretch", textAlign: "left" }}>
                  <label>Booking Time</label>
                  <input type="text" style={{ background: "rgba(255,255,255,0.05)" }} disabled value={bookingDate} />
                </div>
                <div className="measurement-field" style={{ alignItems: "stretch", textAlign: "left" }}>
                  <label>Delivery Date *</label>
                  <input type="date" required value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "0.8fr 2fr 1.2fr", gap: "1rem" }}>
                <div className="measurement-field" style={{ alignItems: "stretch", textAlign: "left" }}>
                  <label style={{ textAlign: "left" }}>Bill No.</label>
                  <input type="text" style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", fontWeight: "bold", color: "var(--color-gold-bright)" }} disabled value={`#${orders.length}`} />
                </div>
                <div className="measurement-field" style={{ alignItems: "stretch", textAlign: "left" }}>
                  <label>Delivery Address</label>
                  <input type="text" value={custAddress} onChange={e => setCustAddress(e.target.value)} placeholder="Address" />
                </div>
                <div className="measurement-field" style={{ alignItems: "stretch", textAlign: "left" }}>
                  <label>Email</label>
                  <input type="email" value={custEmail} onChange={e => setCustEmail(e.target.value)} placeholder="Email" />
                </div>
              </div>

              <div className="paper-form-card">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid #ccc", paddingBottom: "0.5rem" }}>
                  <span style={{ color: "#000", fontWeight: 800 }}>Display Measurements:</span>
                  {(["shirt", "pant", "kurta", "safari", "blazer", "sherwani", "jacket"] as const).map(cat => (
                    <label key={cat} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#000", fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>
                      <input type="checkbox" checked={visibleSpecCategories.includes(cat)} onChange={() => handleSpecCheckboxToggle(cat)} />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {visibleSpecCategories.includes("shirt") && (
                    <div style={{ borderBottom: "1px dashed #aaa", paddingBottom: "1rem" }}>
                      <h4 style={{ color: "#000", fontWeight: 800, marginBottom: "0.5rem" }}>SHIRT (शर्ट) MEASUREMENTS</h4>
                      <div className="paper-input-grid">
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sLength} onChange={e => setSLength(e.target.value)} /><span className="paper-input-label">उंची</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sChest} onChange={e => setSChest(e.target.value)} /><span className="paper-input-label">छाती</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sWaist} onChange={e => setSWaist(e.target.value)} /><span className="paper-input-label">पोट</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sSeat} onChange={e => setSSeat(e.target.value)} /><span className="paper-input-label">शिट</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sShoulder} onChange={e => setSShoulder(e.target.value)} /><span className="paper-input-label">शोल्डर</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sSleeve} onChange={e => setSSleeve(e.target.value)} /><span className="paper-input-label">बाही</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sCollar} onChange={e => setSCollar(e.target.value)} /><span className="paper-input-label">कॉलर</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sCuff} onChange={e => setSCuff(e.target.value)} /><span className="paper-input-label">कफ</span></div>
                      </div>
                      <div style={{ display: "flex", gap: "1.2rem", marginTop: "0.5rem", color: "#000", fontWeight: 700, fontSize: "0.85rem" }}>
                        <label><input type="checkbox" checked={sPocket} onChange={e => setSPocket(e.target.checked)} /> Pocket</label>
                        <label><input type="checkbox" checked={sManela} onChange={e => setSManela(e.target.checked)} /> Manela</label>
                        <label><input type="checkbox" checked={sApple} onChange={e => setSApple(e.target.checked)} /> Apple</label>
                        <label><input type="checkbox" checked={sSideCut} onChange={e => setSSideCut(e.target.checked)} /> Side Cut</label>
                      </div>
                    </div>
                  )}

                  {visibleSpecCategories.includes("pant") && (
                    <div style={{ borderBottom: "1px dashed #aaa", paddingBottom: "1rem" }}>
                      <h4 style={{ color: "#000", fontWeight: 800, marginBottom: "0.5rem" }}>PANT (पैंट) MEASUREMENTS</h4>
                      <div className="paper-input-grid">
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={pLength} onChange={e => setPLength(e.target.value)} /><span className="paper-input-label">उंची</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={pWaist} onChange={e => setPWaist(e.target.value)} /><span className="paper-input-label">कंबर</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={pSeat} onChange={e => setPSeat(e.target.value)} /><span className="paper-input-label">सीट</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={pKnee} onChange={e => setPKnee(e.target.value)} /><span className="paper-input-label">गुडघा</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={pBottom} onChange={e => setPBottom(e.target.value)} /><span className="paper-input-label">बॉटम</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={pThigh} onChange={e => setPThigh(e.target.value)} /><span className="paper-input-label">मांडी</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={pInseam} onChange={e => setPInseam(e.target.value)} /><span className="paper-input-label">अंदर</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={pFront} onChange={e => setPFront(e.target.value)} /><span className="paper-input-label">फ्रंट</span></div>
                      </div>
                      <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem", color: "#000", fontWeight: 700, fontSize: "0.85rem" }}>
                        <label><input type="checkbox" checked={pTight} onChange={e => { setPTight(e.target.checked); if (e.target.checked) setPLoose(false); }} /> Tight Fit</label>
                        <label><input type="checkbox" checked={pLoose} onChange={e => { setPLoose(e.target.checked); if (e.target.checked) setPTight(false); }} /> Loose Fit</label>
                      </div>
                    </div>
                  )}

                  {visibleSpecCategories.includes("kurta") && (
                    <div style={{ borderBottom: "1px dashed #aaa", paddingBottom: "1rem" }}>
                      <h4 style={{ color: "#000", fontWeight: 800, marginBottom: "0.5rem" }}>KURTA MEASUREMENTS</h4>
                      <div className="paper-input-grid">
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={kLength} onChange={e => setKLength(e.target.value)} /><span className="paper-input-label">Length</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={kChest} onChange={e => setKChest(e.target.value)} /><span className="paper-input-label">Chest</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={kWaist} onChange={e => setKWaist(e.target.value)} /><span className="paper-input-label">Waist</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={kSeat} onChange={e => setKSeat(e.target.value)} /><span className="paper-input-label">Seat</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={kShoulder} onChange={e => setKShoulder(e.target.value)} /><span className="paper-input-label">Shoulder</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={kSleeve} onChange={e => setKSleeve(e.target.value)} /><span className="paper-input-label">Sleeve</span></div>
                        <div className="paper-input-cell" style={{ gridColumn: "span 2" }}><input type="text" className="paper-input-field" value={kCollar} onChange={e => setKCollar(e.target.value)} /><span className="paper-input-label">Collar</span></div>
                      </div>
                    </div>
                  )}

                  {visibleSpecCategories.includes("safari") && (
                    <div style={{ borderBottom: "1px dashed #aaa", paddingBottom: "1rem" }}>
                      <h4 style={{ color: "#000", fontWeight: 800, marginBottom: "0.5rem" }}>SAFARI MEASUREMENTS</h4>
                      <div className="paper-input-grid">
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sfLength} onChange={e => setSfLength(e.target.value)} /><span className="paper-input-label">Length</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sfChest} onChange={e => setSfChest(e.target.value)} /><span className="paper-input-label">Chest</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sfWaist} onChange={e => setSfWaist(e.target.value)} /><span className="paper-input-label">Waist</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sfSeat} onChange={e => setSfSeat(e.target.value)} /><span className="paper-input-label">Seat</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sfShoulder} onChange={e => setSfShoulder(e.target.value)} /><span className="paper-input-label">Shoulder</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={sfSleeve} onChange={e => setSfSleeve(e.target.value)} /><span className="paper-input-label">Sleeve</span></div>
                        <div className="paper-input-cell" style={{ gridColumn: "span 2" }}><input type="text" className="paper-input-field" value={sfCollar} onChange={e => setSfCollar(e.target.value)} /><span className="paper-input-label">Collar</span></div>
                      </div>
                    </div>
                  )}

                  {visibleSpecCategories.includes("blazer") && (
                    <div style={{ borderBottom: "1px dashed #aaa", paddingBottom: "1rem" }}>
                      <h4 style={{ color: "#000", fontWeight: 800, marginBottom: "0.5rem" }}>BLAZER MEASUREMENTS</h4>
                      <div className="paper-input-grid">
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={bLength} onChange={e => setBLength(e.target.value)} /><span className="paper-input-label">Length</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={bChest} onChange={e => setBChest(e.target.value)} /><span className="paper-input-label">Chest</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={bWaist} onChange={e => setBWaist(e.target.value)} /><span className="paper-input-label">Waist</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={bSeat} onChange={e => setBSeat(e.target.value)} /><span className="paper-input-label">Seat</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={bShoulder} onChange={e => setBShoulder(e.target.value)} /><span className="paper-input-label">Shoulder</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={bSleeve} onChange={e => setBSleeve(e.target.value)} /><span className="paper-input-label">Sleeve</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={bLapel} onChange={e => setBLapel(e.target.value)} /><span className="paper-input-label">Lapel</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={bAcrossBack} onChange={e => setBAcrossBack(e.target.value)} /><span className="paper-input-label">Across Back</span></div>
                      </div>
                    </div>
                  )}

                  {visibleSpecCategories.includes("sherwani") && (
                    <div style={{ borderBottom: "1px dashed #aaa", paddingBottom: "1rem" }}>
                      <h4 style={{ color: "#000", fontWeight: 800, marginBottom: "0.5rem" }}>SHERWANI MEASUREMENTS</h4>
                      <div className="paper-input-grid">
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={shLength} onChange={e => setShLength(e.target.value)} /><span className="paper-input-label">Length</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={shChest} onChange={e => setShChest(e.target.value)} /><span className="paper-input-label">Chest</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={shWaist} onChange={e => setShWaist(e.target.value)} /><span className="paper-input-label">Waist</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={shSeat} onChange={e => setShSeat(e.target.value)} /><span className="paper-input-label">Seat</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={shShoulder} onChange={e => setShShoulder(e.target.value)} /><span className="paper-input-label">Shoulder</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={shSleeve} onChange={e => setShSleeve(e.target.value)} /><span className="paper-input-label">Sleeve</span></div>
                        <div className="paper-input-cell" style={{ gridColumn: "span 2" }}><input type="text" className="paper-input-field" value={shCollar} onChange={e => setShCollar(e.target.value)} /><span className="paper-input-label">Collar</span></div>
                      </div>
                    </div>
                  )}

                  {visibleSpecCategories.includes("jacket") && (
                    <div style={{ paddingBottom: "1rem" }}>
                      <h4 style={{ color: "#000", fontWeight: 800, marginBottom: "0.5rem" }}>JACKET MEASUREMENTS</h4>
                      <div className="paper-input-grid">
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={jLength} onChange={e => setJLength(e.target.value)} /><span className="paper-input-label">Length</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={jChest} onChange={e => setJChest(e.target.value)} /><span className="paper-input-label">Chest</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={jWaist} onChange={e => setJWaist(e.target.value)} /><span className="paper-input-label">Waist</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={jSeat} onChange={e => setJSeat(e.target.value)} /><span className="paper-input-label">Seat</span></div>
                        <div className="paper-input-cell"><input type="text" className="paper-input-field" value={jShoulder} onChange={e => setJShoulder(e.target.value)} /><span className="paper-input-label">Shoulder</span></div>
                        <div className="paper-input-cell" style={{ gridColumn: "span 3" }}><input type="text" className="paper-input-field" value={jSleeve} onChange={e => setJSleeve(e.target.value)} /><span className="paper-input-label">Sleeve</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "8px", padding: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ color: "var(--color-gold)", fontSize: "0.95rem" }}>Invoice Billing Items</h3>
                  <button type="button" className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={addBillingRow}>
                    <PlusCircle size={14} style={{ marginRight: 4 }} /> Add Item Row
                  </button>
                </div>

                <table className="paper-table" style={{ background: "var(--bg-primary)", color: "white", border: "1px solid var(--border-gold)" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)", color: "var(--color-gold-bright)" }}>
                      <th style={{ width: "60px", textAlign: "center" }}>No.</th>
                      <th>Description</th>
                      <th style={{ width: "120px", textAlign: "center" }}>Qty.</th>
                      <th style={{ width: "150px", textAlign: "right" }}>Rate (₹)</th>
                      <th style={{ width: "180px", textAlign: "right" }}>Amount (₹)</th>
                      <th style={{ width: "80px", textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingRows.map((row, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: "center" }}>{index + 1}</td>
                        <td>
                          <select 
                            style={{
                              width: "100%",
                              padding: "0.4rem",
                              background: "rgba(8,9,13,0.8)",
                              border: "1px solid var(--border-gold)",
                              borderRadius: "4px",
                              color: "var(--text-primary)"
                            }}
                            value={row.garment}
                            onChange={e => handleBillingRowChange(index, "garment", e.target.value)}
                          >
                            <option value="SHIRT">SHIRT</option>
                            <option value="PANT">PANT</option>
                            <option value="KURTA">KURTA</option>
                            <option value="SAFARI">SAFARI</option>
                            <option value="JACKET">JACKET</option>
                            <option value="BLAZER">BLAZER</option>
                            <option value="SHERWANI">SHERWANI</option>
                          </select>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            min={0} 
                            className="search-input" 
                            style={{ textAlign: "center", padding: "0.4rem" }} 
                            value={row.qty} 
                            onChange={e => handleBillingRowChange(index, "qty", Number(e.target.value))} 
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            min={0} 
                            className="search-input" 
                            style={{ textAlign: "right", padding: "0.4rem" }} 
                            value={row.rate} 
                            onChange={e => handleBillingRowChange(index, "rate", Number(e.target.value))} 
                          />
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>₹{row.qty * row.rate}</td>
                        <td style={{ textAlign: "center" }}>
                          <button type="button" className="btn btn-danger" style={{ padding: "0.4rem" }} onClick={() => removeBillingRow(index)} disabled={billingRows.length <= 1}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: "rgba(212,175,55,0.15)" }}>
                      <td colSpan={4} style={{ textAlign: "right", fontWeight: 800 }}>Total stitching bill amount -</td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: "var(--color-gold-bright)" }}>₹{activeModalTotal}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCustomerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save & Print A5 Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
