export interface Experience {
	title: string;
	organization: string;
	period: string;
	logo: string;
	type: 'experience' | 'education';
}

export const experiences: Experience[] = [
	{
		title: 'Data Center Group Intern',
		organization: 'Intel Corp.',
		period: 'Jul 2025 - Present',
		logo: '/logos/intel.png',
		type: 'experience'
	},
	{
		title: 'Research Assistant',
		organization: 'Academia Sinica',
		period: 'Jul 2022 - Present',
		logo: '/logos/academia-sinica.png',
		type: 'experience'
	},
	{
		title: 'Software Engineer Intern',
		organization: 'Mediatek Inc.',
		period: 'Jul 2024 - Dec 2024',
		logo: '/logos/mediatek.png',
		type: 'experience'
	}
];

export const educations: Experience[] = [
	{
		title: 'M.S. in Electrical Engineering',
		organization: 'Stanford University',
		period: 'Sep 2026 - Present',
		logo: '/logos/stanford.png',
		type: 'education'
	},
	{
		title: 'B.S. in Computer Science',
		organization: 'National ChengChi University',
		period: 'Sep 2021 - Jun 2025',
		logo: '/logos/nccu.png',
		type: 'education'
	}
];
