import * as XLSX from 'xlsx';

export function exportTeamsToExcel(teams) {
  const rows = teams.map((t, i) => ({
    'S.No': i + 1,
    'Team Code': t.teamCode,
    'Team Name': t.teamName,
    'Type': t.registrationType === 'individual' ? 'Individual' : 'Team',
    'Member 1 Name': t.members[0]?.name || '',
    'Member 1 Email': t.members[0]?.email || '',
    'Member 1 Phone': t.members[0]?.phone || '',
    'Member 2 Name': t.members[1]?.name || '',
    'Member 2 Email': t.members[1]?.email || '',
    'Member 3 Name': t.members[2]?.name || '',
    'Member 3 Email': t.members[2]?.email || '',
    'Department': t.department,
    'Contact Email': t.contactEmail,
    'Contact Phone': t.contactPhone,
    'ByteCoins': t.byteCoins,
    'Status': t.status,
    'Registered At': new Date(t.createdAt).toLocaleString('en-IN'),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 24 }, { wch: 12 },
    { wch: 20 }, { wch: 24 }, { wch: 14 },
    { wch: 20 }, { wch: 24 },
    { wch: 20 }, { wch: 24 },
    { wch: 18 }, { wch: 26 }, { wch: 14 },
    { wch: 10 }, { wch: 10 }, { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
  XLSX.writeFile(wb, `ByteBrainiacs_Registrations_${Date.now()}.xlsx`);
}
