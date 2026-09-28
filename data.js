window.GRISI_KPI_DATA = {
  cutoff: "Agosto 2026",
  global: {
    tm: 2.40,
    mp: 98.00,
    hours: 829.45,
    tmTrend: [1.78, 2.69, 1.86, 1.80, 1.49, 2.36, 1.89, 2.40],
    mpTrend: [98.00, 99.00, 98.00, 95.08, 100.00, 99.30, 98.00, 98.00]
  },
  months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"],
  plants: {
    VALLEJO: {
      label: "Vallejo", tm: 1.50, tmGoal: 1.50, mp: 96.84, hours: 280,
      equipment: [
        ["Mar II", 82], ["Comadis", 60], ["EQVALL03", 22], ["EQVALL05", 22],
        ["Mizar II", 20], ["EQVALL07", 16], ["EQVALL04", 10], ["EQVALL06", 10],
        ["EQVALL08", 8], ["Otros", 30]
      ]
    },
    CDT: {
      label: "CDT", tm: 1.29, tmGoal: 1.50, mp: null, hours: 62.4,
      note: "El indicador de mantenimiento preventivo continúa en proceso.",
      equipment: [["Multipack", 62.4]]
    },
    CPA: {
      label: "CPA", tm: 5.52, tmGoal: 1.50, mp: 98.00, hours: 484.05,
      equipment: [["JAB C", 207.35], ["JAB A", 166.10], ["JAB B", 110.60]]
    },
    CPH: {
      label: "CPH", tm: 0.12, tmGoal: 4.50, mp: 83.33, hours: 3,
      equipment: [["EQHINDS020", 3]]
    }
  }
};
