export default class GroupData {
	constructor(
		public code: string,
		public somme: number,
		public sommeAujourdhui: number,
		public nombreParticipantsAujourdhui: number,
		public nombreParticipants: number,
		public groupeName: string,
		public objectifJournalier: number,
		public objectifTotal: number
	) {
		this.code = code;
		this.somme = somme;
		this.sommeAujourdhui = sommeAujourdhui;
		this.nombreParticipantsAujourdhui = nombreParticipantsAujourdhui;
		this.nombreParticipants = nombreParticipants;
		this.groupeName = groupeName;
		this.objectifJournalier = objectifJournalier;
		this.objectifTotal = objectifTotal;
	}
}
