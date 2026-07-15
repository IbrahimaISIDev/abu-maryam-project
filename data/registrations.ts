export interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  registeredAt: string;
  status: "confirmed" | "pending" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "free";
  notes?: string;
}

export const registrations: Registration[] = [
  { id: "reg-01", fullName: "Ousmane Diallo", email: "o.diallo@gmail.com", phone: "+221 77 123 45 67", city: "Dakar", registeredAt: "2026-06-10T09:15:00Z", status: "confirmed", paymentStatus: "paid" },
  { id: "reg-02", fullName: "Fatou Mbaye", email: "fatou.mbaye@yahoo.fr", phone: "+221 76 234 56 78", city: "Thiès", registeredAt: "2026-06-11T14:22:00Z", status: "confirmed", paymentStatus: "paid" },
  { id: "reg-03", fullName: "Ibrahima Sow", email: "ibra.sow@gmail.com", phone: "+221 70 345 67 89", city: "Saint-Louis", registeredAt: "2026-06-12T08:40:00Z", status: "pending", paymentStatus: "unpaid" },
  { id: "reg-04", fullName: "Mariama Diop", email: "mariama.diop@outlook.com", phone: "+221 77 456 78 90", city: "Dakar", registeredAt: "2026-06-12T11:05:00Z", status: "confirmed", paymentStatus: "paid" },
  { id: "reg-05", fullName: "Abdoulaye Ba", email: "a.ba@gmail.com", phone: "+221 76 567 89 01", city: "Ziguinchor", registeredAt: "2026-06-13T16:30:00Z", status: "confirmed", paymentStatus: "free", notes: "Étudiant boursier" },
  { id: "reg-06", fullName: "Aïssatou Ndiaye", email: "aissatou.ndiaye@gmail.com", phone: "+221 70 678 90 12", city: "Dakar", registeredAt: "2026-06-14T09:00:00Z", status: "pending", paymentStatus: "unpaid" },
  { id: "reg-07", fullName: "Moussa Traoré", email: "moussa.traore@gmail.com", phone: "+221 77 789 01 23", city: "Kaolack", registeredAt: "2026-06-14T10:45:00Z", status: "confirmed", paymentStatus: "paid" },
  { id: "reg-08", fullName: "Rokhaya Fall", email: "r.fall@hotmail.com", phone: "+221 76 890 12 34", city: "Dakar", registeredAt: "2026-06-15T13:20:00Z", status: "cancelled", paymentStatus: "unpaid", notes: "Annulation maladie" },
  { id: "reg-09", fullName: "Cheikh Ahmed Diallo", email: "c.ahmed@gmail.com", phone: "+221 70 901 23 45", city: "Rufisque", registeredAt: "2026-06-16T08:10:00Z", status: "confirmed", paymentStatus: "paid" },
  { id: "reg-10", fullName: "Khadiatou Sy", email: "khadiatou.sy@gmail.com", phone: "+221 77 012 34 56", city: "Thiès", registeredAt: "2026-06-17T15:00:00Z", status: "confirmed", paymentStatus: "paid" },
  { id: "reg-11", fullName: "Amadou Cissé", email: "amadou.cisse@yahoo.fr", phone: "+221 76 123 45 67", city: "Dakar", registeredAt: "2026-06-18T09:30:00Z", status: "pending", paymentStatus: "unpaid" },
  { id: "reg-12", fullName: "Ndéye Sarr", email: "ndeye.sarr@gmail.com", phone: "+221 70 234 56 78", city: "Mbour", registeredAt: "2026-06-19T11:00:00Z", status: "confirmed", paymentStatus: "paid" },
  { id: "reg-13", fullName: "Seydou Konaté", email: "seydou.konate@gmail.com", phone: "+221 77 345 67 89", city: "Dakar", registeredAt: "2026-06-20T14:15:00Z", status: "confirmed", paymentStatus: "free", notes: "Invité conférencier" },
  { id: "reg-14", fullName: "Aminata Baldé", email: "a.balde@gmail.com", phone: "+221 76 456 78 90", city: "Kolda", registeredAt: "2026-06-21T10:00:00Z", status: "confirmed", paymentStatus: "paid" },
  { id: "reg-15", fullName: "Hassan Touré", email: "hassan.toure@outlook.com", phone: "+221 70 567 89 01", city: "Dakar", registeredAt: "2026-06-22T08:45:00Z", status: "pending", paymentStatus: "unpaid" },
];
