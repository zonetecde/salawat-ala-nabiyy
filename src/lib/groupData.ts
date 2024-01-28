export default class GroupData {
	constructor(
		public code: string,
		public sommeTotal: number,
		public sommeAujourdhui: number,
		public nombreParticipantsAujourdhui: number,
		public nombreParticipants: number,
		public groupeName: string,
		public objectifJournalier: number,
		public objectifTotal: number
	) {
		this.code = code;
		this.sommeTotal = Number(sommeTotal);
		this.sommeAujourdhui = Number(sommeAujourdhui);
		this.nombreParticipantsAujourdhui = Number(nombreParticipantsAujourdhui);
		this.nombreParticipants = Number(nombreParticipants);
		this.groupeName = groupeName;
		this.objectifJournalier = Number(objectifJournalier);
		this.objectifTotal = Number(objectifTotal);
	}
}
