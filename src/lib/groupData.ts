export default class GroupData {
	constructor(
		public code: string,
		public sommeTotal: number,
		public sommeAujourdhui: number,
		public nombreParticipantsAujourdhui: number,
		public nombreParticipants: number,
		public groupeName: string,
		public objectifJournalier: number,
		public objectifTotal: number,
		public somme7derniersJours: number,
		public somme30derniersJours: number,
		public somme365derniersJours: number,
		public moyenneParticipant: number,
		public nombreJoursAvecSalawat: number,
		public moyenneJour: number,
		public recordJournee: number,
		public jourNombre: { date: Date; nombre: number }[]
	) {
		this.code = code;
		this.sommeTotal = Number(sommeTotal);
		this.sommeAujourdhui = Number(sommeAujourdhui);
		this.nombreParticipantsAujourdhui = Number(nombreParticipantsAujourdhui);
		this.nombreParticipants = Number(nombreParticipants);
		this.groupeName = groupeName;
		this.objectifJournalier = Number(objectifJournalier);
		this.objectifTotal = Number(objectifTotal);
		this.somme7derniersJours = Number(somme7derniersJours);
		this.somme30derniersJours = Number(somme30derniersJours);
		this.somme365derniersJours = Number(somme365derniersJours);
		this.moyenneParticipant = Math.floor(Number(moyenneParticipant));
		this.nombreJoursAvecSalawat = Number(nombreJoursAvecSalawat);
		this.moyenneJour = Math.floor(Number(moyenneJour));
		this.recordJournee = Number(recordJournee);
		this.jourNombre = jourNombre;
	}
}
