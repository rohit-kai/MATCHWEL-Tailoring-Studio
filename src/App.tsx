import React, { useState, useEffect } from "react";
import {
  Scissors, Users, FileText, MessageSquare,
  DollarSign, Activity, Plus, MapPin,
  Download, Calendar, Trash2, PlusCircle,
  ChevronLeft, ChevronRight, RefreshCw
} from "lucide-react";
import "./App.css";

// --- Types & Schema Definitions ---
// Dynamic Garment Categories (Settings-configurable)
interface MeasurementFieldDef {
  point: string; // e.g. "1."
  name: string;  // e.g. "उंची"
}

interface GarmentCategory {
  id: string;
  title: string;
  fields: MeasurementFieldDef[];
}

const getFieldLabel = (field: MeasurementFieldDef): string =>
  field.point && field.name ? `${field.point} ${field.name}` : field.point || field.name;

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  measurements: Record<string, Record<string, string>>;
}

interface OrderItem {
  name: string;
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
      blouse: {
        "1. उंची": "30",
        "2. शोल्डर": "18",
        "3. छाती": "40",
        "4. कंबर": "36",
        "5. शिट": "38",
        "6. बाही": "24",
        "7. पु. गळा": "16",
        "8. मा. गळा": ""
      },
      pant: {
        "1. उंची": "41",
        "2. कंबर": "34",
        "3. हिट": "40",
        "4. मांडी": "23",
        "5. गुडघा": "19",
        "6. बॉटम": "16",
        "7. अंदर लाईन": "31"
      }
    }
  },
  {
    id: "c2",
    name: "Rajesh Shinde",
    phone: "9876543210",
    email: "rajesh.shinde@yahoo.com",
    address: "Panvel, Near Station",
    measurements: {
      blouse: {
        "1. उंची": "29",
        "2. शोल्डर": "17.5",
        "3. छाती": "38",
        "4. कंबर": "34",
        "5. शिट": "37",
        "6. बाही": "23.5",
        "7. पु. गळा": "15.5",
        "8. मा. गळा": ""
      },
      pant: {
        "1. उंची": "40",
        "2. कंबर": "32",
        "3. हिट": "38",
        "4. मांडी": "22",
        "5. गुडघा": "18",
        "6. बॉटम": "15.5",
        "7. अंदर लाईन": "30"
      }
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "calendar" | "crm" | "invoices" | "comms" | "backup" | "settings">("dashboard");
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("lucky_ladies_customers");
    if (saved) return JSON.parse(saved);
    const isInit = localStorage.getItem("lucky_ladies_initialized");
    if (isInit === "false") return [];
    return INITIAL_CUSTOMERS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("lucky_ladies_orders");
    if (saved) return JSON.parse(saved);
    const isInit = localStorage.getItem("lucky_ladies_initialized");
    if (isInit === "false") return [];
    return INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem("lucky_ladies_customers", JSON.stringify(customers));
    if (customers.length > 0 && localStorage.getItem("lucky_ladies_initialized") !== "true") {
      localStorage.setItem("lucky_ladies_initialized", "true");
    }
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("lucky_ladies_orders", JSON.stringify(orders));
  }, [orders]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("c1");
  const [commsLog, setCommsLog] = useState<CommLog[]>(() => {
    const saved = localStorage.getItem("lucky_ladies_comms_log");
    if (saved) return JSON.parse(saved);
    const isInit = localStorage.getItem("lucky_ladies_initialized");
    if (isInit === "false") return [];
    return [
      { id: "l1", time: "09:12:00", type: "SMS", recipient: "Sunil Patil", message: "लकी लेडिज टेलर्स: Hi Sunil Patil, your stitching of the top and pant (Bill No: #0) is ready! Just pick up from our store. - LUCKY LADIES TAILORS", status: "Sent" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("lucky_ladies_comms_log", JSON.stringify(commsLog));
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
  const [whatsappSenderNum, setWhatsappSenderNum] = useState("9860980386");

  // Dynamic garment categories configured via Settings
  const [categories, setCategories] = useState<GarmentCategory[]>(() => {
    const saved = localStorage.getItem("lucky_categories");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "blouse",
        title: "टॉप / ब्लाऊज (Top / Blouse)",
        fields: [
          { point: "1.", name: "उंची" },
          { point: "2.", name: "शोल्डर" },
          { point: "3.", name: "छाती" },
          { point: "4.", name: "कंबर" },
          { point: "5.", name: "शिट" },
          { point: "6.", name: "बाही" },
          { point: "7.", name: "पु. गळा" },
          { point: "8.", name: "मा. गळा" }
        ]
      },
      {
        id: "pant",
        title: "पॅंट (Pant)",
        fields: [
          { point: "1.", name: "उंची" },
          { point: "2.", name: "कंबर" },
          { point: "3.", name: "हिट" },
          { point: "4.", name: "मांडी" },
          { point: "5.", name: "गुडघा" },
          { point: "6.", name: "बॉटम" },
          { point: "7.", name: "अंदर लाईन" }
        ]
      }
    ];
  });

  const [editCategories, setEditCategories] = useState<GarmentCategory[]>([]);

  useEffect(() => {
    if (activeTab === "settings") {
      setEditCategories(categories.map(c => ({
        ...c,
        fields: [...c.fields]
      })));
    }
  }, [activeTab, categories]);

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
  const [visibleSpecCategories, setVisibleSpecCategories] = useState<string[]>(["blouse", "pant"]);

  // Orders pipeline tab status filter state
  const [ordersPipelineFilter, setOrdersPipelineFilter] = useState<string>("All");

  // Dynamic values record: categoryId -> fieldLabel -> value
  const [measurementValues, setMeasurementValues] = useState<Record<string, Record<string, string>>>({});

  // Flexible dropdown item billing rows
  interface BookingRow {
    garment: string; // चुडीदार, ब्लाऊज, आम्ब्रेला, शाळेचा युनिफॉर्म, इतर
    qty: number;
    rate: number;
  }
  const [billingRows, setBillingRows] = useState<BookingRow[]>(() => [
    { garment: "ब्लाऊज (Blouse)", qty: 0, rate: 0 }
  ]);

  // Edit Customer Demographics state
  const [isEditingDemographics, setIsEditingDemographics] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Active tab inside CRM Workspace
  const [crmMeasurementCategory, setCrmMeasurementCategory] = useState<string>("blouse");

  // Autofill if mobile number matches
  // Autofill if mobile number matches
  useEffect(() => {
    if (custPhone.length >= 10) {
      const match = customers.find(c => c.phone.replace(/\D/g, "") === custPhone.replace(/\D/g, ""));
      if (match) {
        setIsExistingClient(true);
        setCustName(match.name);
        setCustAddress(match.address);
        setCustEmail(match.email);

        // Load measurements dynamically
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMeasurementValues((match.measurements as any) || {});

        // Determine active categories
        const activeCategories = categories
          .map(cat => cat.id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter(catId => match.measurements && (match.measurements as any)[catId] && Object.values((match.measurements as any)[catId]).some((v: unknown) => v));

        if (activeCategories.length === 0) {
          setVisibleSpecCategories(categories.map(c => c.id));
        } else {
          setVisibleSpecCategories(activeCategories);
        }
      } else {
        setIsExistingClient(false);
      }
    } else {
      setIsExistingClient(false);
    }
  }, [custPhone, customers, categories]);

  // Set booking timestamp upon opening form
  const handleOpenAddForm = () => {
    const now = new Date();
    setBookingDate(now.toLocaleString("en-GB"));
    setVisibleSpecCategories(categories.map(c => c.id));
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
    setBillingRows(prev => [...prev, { garment: "ब्लाऊज (Blouse)", qty: 0, rate: 0 }]);
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
            updated.rate = 0;
          }
          return updated;
        }
        return row;
      });

      // Auto-append if the edited row is the last row, and has a qty > 0 or has changed garment selection
      const isLastRow = index === prev.length - 1;
      const isFilled = (key === "qty" && Number(value) > 0) || (key === "rate" && Number(value) > 0);

      if (isLastRow && isFilled) {
        return [...updatedList, { garment: "ब्लाऊज (Blouse)", qty: 0, rate: 0 }];
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
            measurements: measurementValues
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
        measurements: measurementValues
      };
      setCustomers(prev => [...prev, newCust]);
    }

    // Book Order Bill
    const newBillNo = String(orders.length);

    // Map dynamic billing rows directly
    const orderItems: OrderItem[] = billingRows
      .filter(row => row.qty > 0)
      .map(row => ({ name: row.garment, qty: row.qty, rate: row.rate }));

    const newOrder: Order = {
      id: newBillNo,
      customerId: targetClientId,
      customerName: custName,
      customerPhone: custPhone,
      bookingDate: bookingDate.split(",")[0] || new Date().toISOString().split('T')[0],
      deliveryDate: deliveryDate,
      items: orderItems,
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
        message: `लकी लेडिज टेलर्स: Bill #${newBillNo} booked successfully for ₹${calculateTotal(newOrder)}. Delivery: ${deliveryDate}.`,
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
    setMeasurementValues({});
    setBillingRows([{ garment: "ब्लाऊज (Blouse)", qty: 0, rate: 0 }]);
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
            message: `Update: Delivery date for LUCKY LADIES order Bill No #${o.id} is rescheduled to ${newDate}.`,
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
  const handleCrmMeasurementFieldChange = (field: string, value: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCustomerId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const catMeas = (c.measurements as any)[crmMeasurementCategory] || {};
        return {
          ...c,
          measurements: {
            ...c.measurements,
            [crmMeasurementCategory]: {
              ...catMeas,
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
            message: `LUCKY LADIES TAILORS: Status of your order #${o.id} is now updated to: ${status.toUpperCase()}.`,
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
          <div className="lucky-receipt-container">
            {/* 1. TOP MEASUREMENT SHEETS */}
            <div className="lucky-receipt-measurements">
              {/* Blouse Sheet */}
              <div className="lucky-receipt-sheet-box">
                <div className="lucky-receipt-sheet-header">
                  <span>टॉप / ब्लाऊज :</span>
                  <span className="lucky-receipt-no">No. <span style={{ color: "#d32f2f", fontWeight: "bold" }}>{selectedInvoiceOrder.id}</span></span>
                </div>
                <table className="lucky-receipt-sheet-table">
                  <thead>
                    <tr>
                      <th>उंची</th>
                      <th>शोल्डर</th>
                      <th>छाती</th>
                      <th>कंबर</th>
                      <th>शिट</th>
                      <th>बाही</th>
                      <th>पु. गळा</th>
                      <th>मा. गळा</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{(invoiceCustomer.measurements["blouse"] || {})["1. उंची"] || (invoiceCustomer.measurements["blouse"] || {})["उंची"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["blouse"] || {})["2. शोल्डर"] || (invoiceCustomer.measurements["blouse"] || {})["शोल्डर"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["blouse"] || {})["3. छाती"] || (invoiceCustomer.measurements["blouse"] || {})["छाती"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["blouse"] || {})["4. कंबर"] || (invoiceCustomer.measurements["blouse"] || {})["कंबर"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["blouse"] || {})["5. शिट"] || (invoiceCustomer.measurements["blouse"] || {})["शिट"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["blouse"] || {})["6. बाही"] || (invoiceCustomer.measurements["blouse"] || {})["बाही"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["blouse"] || {})["7. पु. गळा"] || (invoiceCustomer.measurements["blouse"] || {})["पु. गळा"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["blouse"] || {})["8. मा. गळा"] || (invoiceCustomer.measurements["blouse"] || {})["मा. गळा"] || "\u00A0"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pant Sheet */}
              <div className="lucky-receipt-sheet-box" style={{ marginTop: "8px" }}>
                <div className="lucky-receipt-sheet-header">
                  <span>पॅंट :</span>
                  <span className="lucky-receipt-no">No. <span style={{ color: "#d32f2f", fontWeight: "bold" }}>{selectedInvoiceOrder.id}</span></span>
                </div>
                <table className="lucky-receipt-sheet-table">
                  <thead>
                    <tr>
                      <th>उंची</th>
                      <th>कंबर</th>
                      <th>हिट</th>
                      <th>मांडी</th>
                      <th>गुडघा</th>
                      <th>बॉटम</th>
                      <th>अंदर लाईन</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{(invoiceCustomer.measurements["pant"] || {})["1. उंची"] || (invoiceCustomer.measurements["pant"] || {})["उंची"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["pant"] || {})["2. कंबर"] || (invoiceCustomer.measurements["pant"] || {})["कंबर"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["pant"] || {})["3. हिट"] || (invoiceCustomer.measurements["pant"] || {})["हिट"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["pant"] || {})["4. मांडी"] || (invoiceCustomer.measurements["pant"] || {})["मांडी"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["pant"] || {})["5. गुडघा"] || (invoiceCustomer.measurements["pant"] || {})["गुडघा"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["pant"] || {})["6. बॉटम"] || (invoiceCustomer.measurements["pant"] || {})["बॉटम"] || "\u00A0"}</td>
                      <td>{(invoiceCustomer.measurements["pant"] || {})["7. अंदर लाईन"] || (invoiceCustomer.measurements["pant"] || {})["अंदर लाईन"] || "\u00A0"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dotted divider */}
            <div className="lucky-receipt-divider"></div>

            {/* 2. LOGO & BRAND DETAILS */}
            <div className="lucky-receipt-branding">
              <div className="lucky-receipt-logo-side">
                <svg width="45" height="55" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60,10 C62,10 63,12 63,14 C63,16 62,18 60,18 C58,18 57,16 57,14 C57,12 58,10 60,10 Z" stroke="#8c1c2b" strokeWidth="3" fill="none" />
                  <path d="M52,18 C56,22 64,22 68,18" stroke="#8c1c2b" strokeWidth="2.5" fill="none" />
                  <path d="M50,22 L70,22 L65,35 L55,35 Z" fill="#8c1c2b" opacity="0.3" />
                  <path d="M55,35 L35,80 C32,95 25,120 20,135 C35,145 60,150 60,150 C60,150 85,145 100,135 C95,120 88,95 85,80 L65,35" fill="none" stroke="#8c1c2b" strokeWidth="3.5" />
                  <path d="M35,80 C45,95 55,90 60,105 C65,90 75,95 85,80" stroke="#8c1c2b" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M28,110 C40,125 60,120 60,135 C60,120 80,125 92,110" stroke="#8c1c2b" strokeWidth="2" strokeDasharray="3 3" />
                </svg>
              </div>
              <div className="lucky-receipt-text-side">
                <div className="lucky-receipt-main-title">
                  <span className="brand-main" style={{ color: "#8c1c2b" }}>लकी</span>
                  <span className="brand-sub-badge" style={{ color: "#8c1c2b", borderColor: "#8c1c2b" }}>लेडिज टेलर्स</span>
                </div>
                <div className="lucky-receipt-address">
                  १३ वी गल्ली, जय विजय शाळेजवळ, रणवीर चौक, जयसिंगपूर. मोबा. : 9860980386
                </div>
              </div>
            </div>

            <div className="lucky-receipt-meta-row">
              <div className="meta-col">
                <strong>बिल नं. :</strong> <span className="meta-val">{selectedInvoiceOrder.id}</span>
              </div>
              <div className="meta-col" style={{ textAlign: "right" }}>
                <strong>दिनांक :</strong> <span className="meta-val">{selectedInvoiceOrder.bookingDate}</span>
              </div>
            </div>

            <div className="lucky-receipt-name-row">
              <strong>नांव :</strong> <span className="meta-val-name">{selectedInvoiceOrder.customerName}</span>
            </div>

            {/* 3. STITCHING BILL TABLE */}
            <table className="lucky-receipt-bill-table">
              <thead>
                <tr>
                  <th style={{ width: "65%" }}>तपशील</th>
                  <th style={{ width: "15%", textAlign: "center" }}>नग</th>
                  <th style={{ width: "20%", textAlign: "right" }}>रुपये</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(5, selectedInvoiceOrder.items.length) }).map((_, idx) => {
                  const item = selectedInvoiceOrder.items[idx];
                  return (
                    <tr key={idx}>
                      <td>{item ? item.name : "\u00A0"}</td>
                      <td style={{ textAlign: "center" }}>{item ? item.qty : "\u00A0"}</td>
                      <td style={{ textAlign: "right", fontWeight: item ? "bold" : "normal" }}>
                        {item ? `₹${item.qty * item.rate}` : "\u00A0"}
                      </td>
                    </tr>
                  );
                })}
                <tr className="lucky-receipt-calc-row">
                  <td colSpan={2} className="calc-label">एकूण (Total)</td>
                  <td className="calc-val">₹{calculateTotal(selectedInvoiceOrder)}</td>
                </tr>
                <tr className="lucky-receipt-calc-row">
                  <td colSpan={2} className="calc-label">ॲडव्हान्स (Advance)</td>
                  <td className="calc-val">₹0</td>
                </tr>
                <tr className="lucky-receipt-calc-row">
                  <td colSpan={2} className="calc-label">येणे (Balance)</td>
                  <td className="calc-val">₹{calculateTotal(selectedInvoiceOrder)}</td>
                </tr>
              </tbody>
            </table>

            {/* Delivery Date */}
            <div className="lucky-receipt-delivery-date">
              <strong>डिलिव्हरी दि.</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / <strong>२०</strong>&nbsp;&nbsp;
              <span style={{ fontSize: "0.85rem", color: "#8c1c2b", fontWeight: "bold" }}>
                ({selectedInvoiceOrder.deliveryDate.split("-").reverse().join("/")})
              </span>
            </div>

            {/* 4. FOOTER NOTE & SIGN */}
            <div className="lucky-receipt-footer">
              <div className="footer-notes">
                <p>टीप :- १) कपडे दिलेल्या तारखेपासून १ महिन्याचे आत घेऊन जावे नंतर आमची जबाबदारी राहणार नाही.</p>
                <p>२) दि. दिलेल्या तारखेच्या नंतर ६ नंतर दिले जाईल.</p>
                <p style={{ fontWeight: "bold" }}>दर सोमवारी बंद राहील.</p>
              </div>
              <div className="footer-prop">
                <p className="prop-title">प्रोप्रा. मोहसीन दस्तगीर इनामदार</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Desktop Dashboard App */}
      <div className="app-container">
        <aside className="sidebar">
          <div className="brand-section">
            <h2 className="brand-name" style={{ fontSize: "1.4rem", letterSpacing: "1px" }}>लकी लेडिज</h2>
            <div className="brand-subtitle">Lucky Ladies Tailors</div>
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
            <div className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
              <RefreshCw size={18} />
              <span>Settings (सेटिंग्ज)</span>
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
                {activeTab === "settings" && "Custom Settings (सेटिंग्ज)"}
              </h1>
              <p>LUCKY LADIES TAILOR CUSTOM SEWING SYSTEM</p>
            </div>

            <button className="btn btn-primary" onClick={handleOpenAddForm}>
              <Plus size={16} /> New Stitching Bill Form
            </button>
          </div>

          {/* 1. Dashboard */}
          {activeTab === "dashboard" && (
            <div className="lucky-landing-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              
              {/* Brand Hero Welcome Banner */}
              <div className="glass-card" style={{ display: "grid", gridTemplateColumns: "1fr auto 1.5fr", gap: "2rem", alignItems: "center", padding: "2.5rem" }}>
                
                {/* SVG Silhouette Emblem */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div className="lucky-logo-wrapper" style={{ animation: "float 6s ease-in-out infinite" }}>
                    <svg width="130" height="160" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0px 6px 20px rgba(197, 155, 118, 0.45))" }}>
                      <path d="M60,10 C62,10 63,12 63,14 C63,16 62,18 60,18 C58,18 57,16 57,14 C57,12 58,10 60,10 Z" stroke="#e5c19d" strokeWidth="2.5" fill="none" />
                      <path d="M52,18 C56,22 64,22 68,18" stroke="#e5c19d" strokeWidth="2" fill="none" />
                      <path d="M50,22 L70,22 L65,35 L55,35 Z" fill="#c59b76" opacity="0.3" />
                      <path d="M55,35 L35,80 C32,95 25,120 20,135 C35,145 60,150 60,150 C60,150 85,145 100,135 C95,120 88,95 85,80 L65,35" fill="url(#goldGradient)" stroke="#e5c19d" strokeWidth="2.5" />
                      <path d="M35,80 C45,95 55,90 60,105 C65,90 75,95 85,80" stroke="#e5c19d" strokeWidth="1.5" strokeDasharray="3 3" />
                      <path d="M28,110 C40,125 60,120 60,135 C60,120 80,125 92,110" stroke="#e5c19d" strokeWidth="1.5" strokeDasharray="3 3" />
                      <defs>
                        <linearGradient id="goldGradient" x1="60" y1="35" x2="60" y2="150" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#e5c19d" />
                          <stop offset="50%" stopColor="#c59b76" />
                          <stop offset="100%" stopColor="#7a583a" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: "1px", height: "80%", background: "rgba(197, 155, 118, 0.15)" }}></div>

                {/* Banner Text Details */}
                <div>
                  <h2 className="lucky-hero-title" style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", color: "var(--color-gold-bright)", textShadow: "0 0 15px rgba(197, 155, 118, 0.3)", marginBottom: "0.4rem" }}>
                    लकी लेडिज टेलर्स
                  </h2>
                  <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.8rem" }}>
                    Lucky Ladies Tailors & Boutique
                  </p>
                  
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    <p>📍 १३ वी गल्ली, जय विजय शाळेजवळ, रणवीर चौक, जयसिंगपूर.</p>
                    <p>📞 मोबा. नं. : <strong>9860980386</strong> | <strong>7028331155</strong></p>
                    <p style={{ marginTop: "0.3rem", color: "var(--color-gold)" }}>💼 प्रोप्रा. <strong>मोहसीन दस्तगीर इनामदार</strong> (Prop. Mohseen Dastagir Inamdar)</p>
                    <p style={{ display: "inline-block", background: "rgba(239, 68, 68, 0.15)", color: "var(--danger)", padding: "0.15rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.5rem" }}>
                      ⚠️ दर सोमवारी दुकान बंद राहील. (Closed on Mondays)
                    </p>
                  </div>
                </div>

              </div>

              {/* Main Quick Portal Directory & Shop Notices */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
                
                {/* Operations quick-launch shortcuts */}
                <div className="glass-card" style={{ padding: "1.8rem" }}>
                  <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", marginBottom: "1.2rem", fontSize: "0.9rem" }}>
                    Operations & Bookings Directory (कार्यप्रणाली दालन)
                  </h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    
                    <button className="btn btn-primary" onClick={handleOpenAddForm} style={{ flexDirection: "column", height: "110px", justifyContent: "center", gap: "0.5rem", borderRadius: "12px", border: "1px solid var(--border-gold)" }}>
                      <PlusCircle size={26} />
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>नवीन बिल बुकिंग फॉर्म</span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>New Stitching Bill</span>
                    </button>

                    <button className="btn btn-secondary" onClick={() => setActiveTab("orders")} style={{ flexDirection: "column", height: "110px", justifyContent: "center", gap: "0.5rem", borderRadius: "12px" }}>
                      <Scissors size={26} style={{ color: "var(--color-gold)" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>सुरू असणारी कामे</span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>Orders Pipeline</span>
                    </button>

                    <button className="btn btn-secondary" onClick={() => setActiveTab("crm")} style={{ flexDirection: "column", height: "110px", justifyContent: "center", gap: "0.5rem", borderRadius: "12px" }}>
                      <Users size={26} style={{ color: "var(--color-gold)" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>ग्राहक माप नोंद वही</span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>CRM Fitting Books</span>
                    </button>

                    <button className="btn btn-secondary" onClick={() => setActiveTab("settings")} style={{ flexDirection: "column", height: "110px", justifyContent: "center", gap: "0.5rem", borderRadius: "12px" }}>
                      <RefreshCw size={26} style={{ color: "var(--color-gold)" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>मोजमाप सेटिंग्ज</span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>Configure Fields</span>
                    </button>

                  </div>
                </div>

                {/* Shop Rules & Terms Panel */}
                <div className="glass-card" style={{ padding: "1.8rem", background: "rgba(20, 10, 15, 0.45)" }}>
                  <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", marginBottom: "1.2rem", fontSize: "0.9rem" }}>
                    ग्राहक सेवा नियम व अटी (Shop Terms & Rules)
                  </h3>
                  
                  <ul style={{ fontSize: "0.85rem", color: "var(--text-secondary)", paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.8rem", lineHeight: "1.5" }}>
                    <li>
                      <strong>१. वेळेची मर्यादा:</strong> कपडे दिलेल्या डिलिव्हरी तारखेपासून <strong>१ महिन्याचे आत</strong> घेऊन जावे, त्यानंतर कोणत्याही नुकसानीस आमची जबाबदारी राहणार नाही.
                    </li>
                    <li>
                      <strong>२. डिलिव्हरी वेळ:</strong> कपडे ठरवून दिलेल्या डिलिव्हरी तारखेच्या दिवशी <strong>संध्याकाळी ६ वाजल्यानंतर</strong> दिले जातील.
                    </li>
                    <li>
                      <strong>३. सुरक्षा नियम:</strong> कपड्यांची सुरक्षा व अचूक मापे लकी टेलर्सच्या रेकॉर्डमध्ये सुरक्षित राहतील.
                    </li>
                    <li>
                      <strong>४. मोजमाप बदल:</strong> काही सुधारणा किंवा बदल हवे असल्यास ट्रायलच्या वेळी मास्टरशी संपर्क साधावा.
                    </li>
                  </ul>
                </div>

              </div>

              {/* Quick metrics section */}
              <div className="metrics-grid" style={{ marginBottom: 0 }}>
                <div className="glass-card metric-card">
                  <div className="metric-icon-box"><DollarSign size={24} /></div>
                  <div className="metric-info">
                    <h3>Pending Billings (बाकी बिल)</h3>
                    <p>₹{orders.reduce((acc, o) => acc + calculateTotal(o), 0)}</p>
                  </div>
                </div>
                <div className="glass-card metric-card">
                  <div className="metric-icon-box"><Scissors size={24} /></div>
                  <div className="metric-info">
                    <h3>Active Stitchings (चालू कामे)</h3>
                    <p>{orders.filter(o => o.status !== "Delivered").length}</p>
                  </div>
                </div>
                <div className="glass-card metric-card">
                  <div className="metric-icon-box"><Users size={24} /></div>
                  <div className="metric-info">
                    <h3>Total Clients (एकूण ग्राहक)</h3>
                    <p>{customers.length}</p>
                  </div>
                </div>
              </div>

              {/* Deadlines calendar quick-view list */}
              <div className="glass-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 className="brand-subtitle" style={{ color: "var(--color-gold)", margin: 0, fontSize: "0.9rem" }}>
                    Delivery calendar Deadlines (डिलिव्हरी वेळापत्रक)
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
                                    ? `LUCKY LADIES: Hi ${o.customerName}, your stitching of the ${o.items.map(item => item.name.toLowerCase()).join(" and ")} (Bill No: #${o.id}) is ready! Just pick up from our store. - LUCKY LADIES TAILORS`
                                    : `LUCKY LADIES: Hi ${o.customerName}, status update for order #${o.id} is: ${o.status.toUpperCase()}. Target delivery: ${o.deliveryDate}.`;

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
                                    ? `LUCKY LADIES: Hi ${o.customerName}, your stitching of the ${o.items.map(item => item.name.toLowerCase()).join(" and ")} (Bill No: #${o.id}) is ready! Just pick up from our store. - LUCKY LADIES TAILORS`
                                    : `LUCKY LADIES Alert: Your order #${o.id} status is now ${o.status}. Delivery Date: ${o.deliveryDate}.`;

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
                      <strong>ℹ GCal Retention Rule:</strong> Past delivery calendar events are automatically pruned from Google Calendar 24h after completion to avoid cluttering your calendar. Local LUCKY LADIES invoice database remains fully preserved.
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
                    {categories.map(cat => (
                      <button key={cat.id} className={`garment-tab ${crmMeasurementCategory === cat.id ? "active" : ""}`} onClick={() => setCrmMeasurementCategory(cat.id)}>
                        {cat.title}
                      </button>
                    ))}
                  </div>

                  <div className="paper-form-card">
                    <div className="paper-input-grid">
                      {(() => {
                        const cat = categories.find(c => c.id === crmMeasurementCategory);
                        if (!cat) return null;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const catMeasurements: Record<string, string> = ((selectedCustomer.measurements as any)[cat.id] || {});
                        return cat.fields.map(field => {
                          const label = getFieldLabel(field);
                          return (
                            <div className="paper-input-cell" key={label}>
                              <input
                                type="text"
                                className="paper-input-field"
                                value={catMeasurements[label] || ""}
                                onChange={e => handleCrmMeasurementFieldChange(label, e.target.value)}
                              />
                              <span className="paper-input-label">{label}</span>
                            </div>
                          );
                        });
                      })()}
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
                    <Download size={16} /> Print LUCKY LADIES Bill Receipt
                  </button>
                </div>

                {selectedInvoiceOrder ? (
                  <div className="lucky-receipt-container">
                    {/* 1. TOP MEASUREMENT SHEETS */}
                    <div className="lucky-receipt-measurements">
                      {/* Blouse Sheet */}
                      <div className="lucky-receipt-sheet-box">
                        <div className="lucky-receipt-sheet-header">
                          <span>टॉप / ब्लाऊज :</span>
                          <span className="lucky-receipt-no">No. <span style={{ color: "#d32f2f", fontWeight: "bold" }}>{selectedInvoiceOrder.id}</span></span>
                        </div>
                        <table className="lucky-receipt-sheet-table">
                          <thead>
                            <tr>
                              <th>उंची</th>
                              <th>शोल्डर</th>
                              <th>छाती</th>
                              <th>कंबर</th>
                              <th>शिट</th>
                              <th>बाही</th>
                              <th>पु. गळा</th>
                              <th>मा. गळा</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{(invoiceCustomer.measurements["blouse"] || {})["1. उंची"] || (invoiceCustomer.measurements["blouse"] || {})["उंची"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["blouse"] || {})["2. शोल्डर"] || (invoiceCustomer.measurements["blouse"] || {})["शोल्डर"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["blouse"] || {})["3. छाती"] || (invoiceCustomer.measurements["blouse"] || {})["छाती"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["blouse"] || {})["4. कंबर"] || (invoiceCustomer.measurements["blouse"] || {})["कंबर"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["blouse"] || {})["5. शिट"] || (invoiceCustomer.measurements["blouse"] || {})["शिट"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["blouse"] || {})["6. बाही"] || (invoiceCustomer.measurements["blouse"] || {})["बाही"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["blouse"] || {})["7. पु. गळा"] || (invoiceCustomer.measurements["blouse"] || {})["पु. गळा"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["blouse"] || {})["8. मा. गळा"] || (invoiceCustomer.measurements["blouse"] || {})["मा. गळा"] || "\u00A0"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Pant Sheet */}
                      <div className="lucky-receipt-sheet-box" style={{ marginTop: "8px" }}>
                        <div className="lucky-receipt-sheet-header">
                          <span>पॅंट :</span>
                          <span className="lucky-receipt-no">No. <span style={{ color: "#d32f2f", fontWeight: "bold" }}>{selectedInvoiceOrder.id}</span></span>
                        </div>
                        <table className="lucky-receipt-sheet-table">
                          <thead>
                            <tr>
                              <th>उंची</th>
                              <th>कंबर</th>
                              <th>हिट</th>
                              <th>मांडी</th>
                              <th>गुडघा</th>
                              <th>बॉटम</th>
                              <th>अंदर लाईन</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{(invoiceCustomer.measurements["pant"] || {})["1. उंची"] || (invoiceCustomer.measurements["pant"] || {})["उंची"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["pant"] || {})["2. कंबर"] || (invoiceCustomer.measurements["pant"] || {})["कंबर"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["pant"] || {})["3. हिट"] || (invoiceCustomer.measurements["pant"] || {})["हिट"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["pant"] || {})["4. मांडी"] || (invoiceCustomer.measurements["pant"] || {})["मांडी"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["pant"] || {})["5. गुडघा"] || (invoiceCustomer.measurements["pant"] || {})["गुडघा"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["pant"] || {})["6. बॉटम"] || (invoiceCustomer.measurements["pant"] || {})["बॉटम"] || "\u00A0"}</td>
                              <td>{(invoiceCustomer.measurements["pant"] || {})["7. अंदर लाईन"] || (invoiceCustomer.measurements["pant"] || {})["अंदर लाईन"] || "\u00A0"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Dotted divider */}
                    <div className="lucky-receipt-divider"></div>

                    {/* 2. LOGO & BRAND DETAILS */}
                    <div className="lucky-receipt-branding">
                      <div className="lucky-receipt-logo-side">
                        <svg width="45" height="55" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M60,10 C62,10 63,12 63,14 C63,16 62,18 60,18 C58,18 57,16 57,14 C57,12 58,10 60,10 Z" stroke="#8c1c2b" strokeWidth="3" fill="none" />
                          <path d="M52,18 C56,22 64,22 68,18" stroke="#8c1c2b" strokeWidth="2.5" fill="none" />
                          <path d="M50,22 L70,22 L65,35 L55,35 Z" fill="#8c1c2b" opacity="0.3" />
                          <path d="M55,35 L35,80 C32,95 25,120 20,135 C35,145 60,150 60,150 C60,150 85,145 100,135 C95,120 88,95 85,80 L65,35" fill="none" stroke="#8c1c2b" strokeWidth="3.5" />
                          <path d="M35,80 C45,95 55,90 60,105 C65,90 75,95 85,80" stroke="#8c1c2b" strokeWidth="2" strokeDasharray="3 3" />
                          <path d="M28,110 C40,125 60,120 60,135 C60,120 80,125 92,110" stroke="#8c1c2b" strokeWidth="2" strokeDasharray="3 3" />
                        </svg>
                      </div>
                      <div className="lucky-receipt-text-side">
                        <div className="lucky-receipt-main-title">
                          <span className="brand-main" style={{ color: "#8c1c2b" }}>लकी</span>
                          <span className="brand-sub-badge" style={{ color: "#8c1c2b", borderColor: "#8c1c2b" }}>लेडिज टेलर्स</span>
                        </div>
                        <div className="lucky-receipt-address">
                          १३ वी गल्ली, जय विजय शाळेजवळ, रणवीर चौक, जयसिंगपूर. मोबा. : 9860980386
                        </div>
                      </div>
                    </div>

                    <div className="lucky-receipt-meta-row">
                      <div className="meta-col">
                        <strong>बिल नं. :</strong> <span className="meta-val">{selectedInvoiceOrder.id}</span>
                      </div>
                      <div className="meta-col" style={{ textAlign: "right" }}>
                        <strong>दिनांक :</strong> <span className="meta-val">{selectedInvoiceOrder.bookingDate}</span>
                      </div>
                    </div>

                    <div className="lucky-receipt-name-row">
                      <strong>नांव :</strong> <span className="meta-val-name">{selectedInvoiceOrder.customerName}</span>
                    </div>

                    {/* 3. STITCHING BILL TABLE */}
                    <table className="lucky-receipt-bill-table">
                      <thead>
                        <tr>
                          <th style={{ width: "65%" }}>तपशील</th>
                          <th style={{ width: "15%", textAlign: "center" }}>नग</th>
                          <th style={{ width: "20%", textAlign: "right" }}>रुपये</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: Math.max(5, selectedInvoiceOrder.items.length) }).map((_, idx) => {
                          const item = selectedInvoiceOrder.items[idx];
                          return (
                            <tr key={idx}>
                              <td>{item ? item.name : "\u00A0"}</td>
                              <td style={{ textAlign: "center" }}>{item ? item.qty : "\u00A0"}</td>
                              <td style={{ textAlign: "right", fontWeight: item ? "bold" : "normal" }}>
                                {item ? `₹${item.qty * item.rate}` : "\u00A0"}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="lucky-receipt-calc-row">
                          <td colSpan={2} className="calc-label">एकूण (Total)</td>
                          <td className="calc-val">₹{calculateTotal(selectedInvoiceOrder)}</td>
                        </tr>
                        <tr className="lucky-receipt-calc-row">
                          <td colSpan={2} className="calc-label">ॲडव्हान्स (Advance)</td>
                          <td className="calc-val">₹0</td>
                        </tr>
                        <tr className="lucky-receipt-calc-row">
                          <td colSpan={2} className="calc-label">येणे (Balance)</td>
                          <td className="calc-val">₹{calculateTotal(selectedInvoiceOrder)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Delivery Date */}
                    <div className="lucky-receipt-delivery-date">
                      <strong>डिलिव्हरी दि.</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / <strong>२०</strong>&nbsp;&nbsp;
                      <span style={{ fontSize: "0.85rem", color: "#8c1c2b", fontWeight: "bold" }}>
                        ({selectedInvoiceOrder.deliveryDate.split("-").reverse().join("/")})
                      </span>
                    </div>

                    {/* 4. FOOTER NOTE & SIGN */}
                    <div className="lucky-receipt-footer">
                      <div className="footer-notes">
                        <p>टीप :- १) कपडे दिलेल्या तारखेपासून १ महिन्याचे आत घेऊन जावे नंतर आमची जबाबदारी राहणार नाही.</p>
                        <p>२) दि. दिलेल्या तारखेच्या नंतर ६ नंतर दिले जाईल.</p>
                        <p style={{ fontWeight: "bold" }}>दर सोमवारी बंद राहील.</p>
                      </div>
                      <div className="footer-prop">
                        <p className="prop-title">प्रोप्रा. मोहसीन दस्तगीर इनामदार</p>
                      </div>
                    </div>
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
                              const msg = `LUCKY LADIES: Hi ${o.customerName}, your stitching of the ${o.items.map(item => item.name.toLowerCase()).join(" and ")} (Bill No: #${o.id}) is ready! Just pick up from our store. - LUCKY LADIES TAILORS`;
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
                              const msg = `LUCKY LADIES: Hi ${o.customerName}, your stitching of the ${o.items.map(item => item.name.toLowerCase()).join(" and ")} (Bill No: #${o.id}) is ready! Just pick up from our store. - LUCKY LADIES TAILORS`;
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
              let csv = "Name,Phone,Email,Address,MeasurementsJSON\n";

              customers.forEach(c => {
                const measurementsStr = JSON.stringify(c.measurements).replace(/"/g, '""');
                const row = [
                  `"${c.name.replace(/"/g, '""')}"`,
                  `"${c.phone}"`,
                  `"${c.email}"`,
                  `"${c.address.replace(/"/g, '""')}"`,
                  `"${measurementsStr}"`
                ];
                csv += row.join(",") + "\n";
              });

              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `LUCKY LADIES_customers_${new Date().toISOString().split('T')[0]}.csv`);
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
              link.setAttribute("download", `LUCKY LADIES_orders_${new Date().toISOString().split('T')[0]}.csv`);
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

                    const pantLength = cols[16] || "";
                    const pantWaist = cols[17] || "";
                    const pantSeat = cols[18] || "";
                    const pantKnee = cols[19] || "";
                    const pantBottom = cols[20] || "";
                    const pantThigh = cols[21] || "";
                    const pantInseam = cols[22] || "";

                    importedCusts.push({
                      id: "c" + (customers.length + importedCusts.length + 1),
                      name,
                      phone,
                      email,
                      address,
                      measurements: {
                        blouse: {
                          "1. उंची": shirtLength,
                          "2. शोल्डर": shirtShoulder,
                          "3. छाती": shirtChest,
                          "4. कंबर": shirtWaist,
                          "5. शिट": shirtSeat,
                          "6. बाही": shirtSleeve,
                          "7. पु. गळा": shirtCollar,
                          "8. मा. गळा": ""
                        },
                        pant: {
                          "1. उंची": pantLength,
                          "2. कंबर": pantWaist,
                          "3. हिट": pantSeat,
                          "4. मांडी": pantThigh,
                          "5. गुडघा": pantKnee,
                          "6. बॉटम": pantBottom,
                          "7. अंदर लाईन": pantInseam
                        }
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
                            localStorage.clear();
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

          {/* 6. Settings Tab */}
          {activeTab === "settings" && (() => {
            const handleSaveSettings = () => {
              setCategories(editCategories);
              localStorage.setItem("lucky_categories", JSON.stringify(editCategories));
              alert("Settings saved! (सेटिंग्ज सेव्ह झाल्या!)");
            };

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Configure garment categories and their measurement point lists. Each category appears in the booking form and CRM fittings panel.
                </p>

                {editCategories.map((cat, catIdx) => (
                  <div key={cat.id} className="glass-card" style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Category Title</label>
                        <input
                          type="text"
                          value={cat.title}
                          onChange={e => {
                            const updated = [...editCategories];
                            updated[catIdx] = { ...updated[catIdx], title: e.target.value };
                            setEditCategories(updated);
                          }}
                          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-gold)", borderRadius: "6px", padding: "0.5rem 0.8rem", color: "var(--text-primary)", fontSize: "1rem", fontWeight: 600 }}
                        />
                      </div>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", marginTop: "1.2rem" }}
                        onClick={() => setEditCategories(prev => prev.filter((_, i) => i !== catIdx))}
                      >
                        <Trash2 size={14} /> Delete Category
                      </button>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--text-muted)", width: "100px" }}>Point No.</th>
                          <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--text-muted)" }}>Measurement Name</th>
                          <th style={{ width: "80px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.fields.map((field, fieldIdx) => (
                          <tr key={fieldIdx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ padding: "0.4rem" }}>
                              <input
                                type="text"
                                value={field.point}
                                onChange={e => {
                                  const updated = [...editCategories];
                                  updated[catIdx].fields[fieldIdx] = { ...field, point: e.target.value };
                                  setEditCategories([...updated]);
                                }}
                                style={{ width: "80px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "0.35rem 0.5rem", color: "var(--color-gold-bright)", fontWeight: 700, textAlign: "center" }}
                              />
                            </td>
                            <td style={{ padding: "0.4rem" }}>
                              <input
                                type="text"
                                value={field.name}
                                onChange={e => {
                                  const updated = [...editCategories];
                                  updated[catIdx].fields[fieldIdx] = { ...field, name: e.target.value };
                                  setEditCategories([...updated]);
                                }}
                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "0.35rem 0.8rem", color: "var(--text-primary)" }}
                              />
                            </td>
                            <td style={{ padding: "0.4rem", textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...editCategories];
                                  updated[catIdx].fields = updated[catIdx].fields.filter((_, i) => i !== fieldIdx);
                                  setEditCategories([...updated]);
                                }}
                                style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.9rem" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ marginTop: "0.8rem", padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
                      onClick={() => {
                        const updated = [...editCategories];
                        const nextNum = updated[catIdx].fields.length + 1;
                        updated[catIdx].fields = [...updated[catIdx].fields, { point: `${nextNum}.`, name: "" }];
                        setEditCategories([...updated]);
                      }}
                    >
                      <PlusCircle size={14} style={{ marginRight: 4 }} /> Add Point
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ alignSelf: "flex-start" }}
                  onClick={() => {
                    const newId = `cat_${Date.now()}`;
                    setEditCategories(prev => [...prev, { id: newId, title: "New Category", fields: [{ point: "1.", name: "" }] }]);
                  }}
                >
                  <PlusCircle size={16} style={{ marginRight: 6 }} /> Add Category
                </button>

                <div style={{ display: "flex", gap: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
                  <button className="btn btn-primary" onClick={handleSaveSettings}>
                    Save Configuration (सेव्ह करा)
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ background: "var(--danger)", border: "none" }}
                    onClick={() => {
                      if (confirm("WARNING: Are you absolutely sure you want to trigger a full system factory reset? ALL data will be permanently lost!")) {
                        localStorage.clear();
                        setCustomers([]);
                        setOrders([]);
                        setCommsLog([]);
                        alert("System successfully reset to factory defaults. Restarting application...");
                        window.location.reload();
                      }
                    }}
                  >
                    Factory Reset (फॅक्टरी रीसेट)
                  </button>
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
                  <span style={{ color: "#000", fontWeight: 800 }}>माप घ्या (Select Categories):</span>
                  {categories.map(cat => (
                    <label key={cat.id} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#000", fontWeight: 700, cursor: "pointer" }}>
                      <input type="checkbox" checked={visibleSpecCategories.includes(cat.id)} onChange={() => handleSpecCheckboxToggle(cat.id)} />
                      <span>{cat.title}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {categories
                    .filter(cat => visibleSpecCategories.includes(cat.id))
                    .map((cat, catIdx, arr) => (
                      <div key={cat.id} style={{ borderBottom: catIdx < arr.length - 1 ? "1px dashed #aaa" : "none", paddingBottom: "1rem" }}>
                        <h4 style={{ color: "#000", fontWeight: 800, marginBottom: "0.5rem" }}>{cat.title.toUpperCase()} MEASUREMENTS</h4>
                        <div className="paper-input-grid">
                          {cat.fields.map(field => {
                            const label = getFieldLabel(field);
                            return (
                              <div className="paper-input-cell" key={label}>
                                <input
                                  type="text"
                                  className="paper-input-field"
                                  value={(measurementValues[cat.id] || {})[label] || ""}
                                  onChange={e => setMeasurementValues(prev => ({
                                    ...prev,
                                    [cat.id]: { ...(prev[cat.id] || {}), [label]: e.target.value }
                                  }))}
                                />
                                <span className="paper-input-label">{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
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
                            <option value="ब्लाऊज (Blouse)">ब्लाऊज (Blouse)</option>
                            <option value="चुडीदार (Chudidar)">चुडीदार (Chudidar)</option>
                            <option value="आम्ब्रेला (Umbrella)">आम्ब्रेला (Umbrella)</option>
                            <option value="शाळेचा युनिफॉर्म (School Uniform)">शाळेचा युनिफॉर्म (School Uniform)</option>
                            {categories.map(cat => {
                              if (cat.id === "blouse") return null;
                              return <option key={cat.id} value={cat.title}>{cat.title}</option>;
                            })}
                            <option value="इतर (Other)">इतर (Other)</option>
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
