export const DEFAULT_MEAL_PLAN_INSTRUCTIONS = [
  {
    instruction_type: 'daily_requirements',
    content: 'ΗΜΕΡΗΣΙΩΣ: 2-2,5lt νερό τουλάχιστον',
    display_order: 0
  },
  {
    instruction_type: 'daily_requirements', 
    content: 'ΕΛΑΙΟΛ./ΗΜΕΡΑ: 2 κς ελαιόλαδο',
    display_order: 1
  },
  {
    instruction_type: 'substitutions',
    content: 'ΑΝΤΙΚΑΤΑΣΤΑΣΕΙΣ ΤΡΟΦΙΜΩΝ:\n• 1 φέτα ψωμί ολικής = 30γρ\n• 1 κς μέλι = 15γρ\n• 1 κγ ταχίνι = 5γρ\n• 1 μικρό φρούτο = 80-100γρ\n• 1 μεσαίο φρούτο = 120-150γρ\n• 1 μεγάλο φρούτο = 200γρ',
    display_order: 2
  },
  {
    instruction_type: 'substitutions',
    content: 'ΠΡΩΤΕΪΝΕΣ:\n• 100γρ κρέας = 100γρ ψάρι = 100γρ κοτόπουλο\n• 1 αυγό = 30γρ τυρί = 1 κς ταχίνι\n• 150γρ όσπρια (βρασμένα) = 100γρ κρέας',
    display_order: 3
  },
  {
    instruction_type: 'substitutions',
    content: 'ΥΔΑΤΑΝΘΡΑΚΕΣ:\n• 1 φέτα ψωμί = 3 κς ρύζι (βρασμένο)\n• 1 φέτα ψωμί = 2 κς δημητριακά\n• 1 φέτα ψωμί = 1 μεσαία πατάτα (100γρ)',
    display_order: 4
  },
  {
    instruction_type: 'substitutions',
    content: 'ΓΑΛΑΚΤΟΚΟΜΙΚΑ:\n• 1 ποτήρι γάλα (250ml) = 200γρ γιαούρτι\n• 30γρ τυρί = 250ml γάλα = 200γρ γιαούρτι',
    display_order: 5
  },
  {
    instruction_type: 'guidelines',
    content: 'ΟΔΗΓΙΕΣ ΠΡΟΕΤΟΙΜΑΣΙΑΣ:\n• Προτιμήστε βράσιμο, ψήσιμο στη σχάρα ή στον ατμό\n• Αποφύγετε το τηγάνισμα\n• Χρησιμοποιήστε μυρωδικά και βότανα για γεύση\n• Καταναλώστε τα γεύματα σε τακτά διαστήματα',
    display_order: 6
  },
  {
    instruction_type: 'guidelines',
    content: 'ΣΗΜΑΝΤΙΚΕΣ ΣΗΜΕΙΩΣΕΙΣ:\n• Τα γεύματα μπορούν να αντικατασταθούν μεταξύ τους εντός της ίδιας κατηγορίας\n• Σε περίπτωση αλλεργίας ή δυσανεξίας, επικοινωνήστε για εναλλακτικές\n• Τηρήστε τις ποσότητες για βέλτιστα αποτελέσματα',
    display_order: 7
  }
];

export const getDefaultInstructions = () => {
  return DEFAULT_MEAL_PLAN_INSTRUCTIONS.map(instruction => ({
    ...instruction,
    id: crypto.randomUUID(), // Generate temporary ID for new instructions
  }));
};