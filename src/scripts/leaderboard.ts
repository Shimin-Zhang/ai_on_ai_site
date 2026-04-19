// src/scripts/leaderboard.ts
const table = document.getElementById('leaderboard-table') as HTMLTableElement | null;
if (table) {
  const tbody = table.querySelector('tbody')!;
  let activeKey: string | null = null;
  let asc = true;

  table.querySelectorAll<HTMLTableCellElement>('th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort!;
      if (activeKey === key) asc = !asc;
      else { activeKey = key; asc = key === 'rank'; }

      const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>('tr'));
      const colIndex = Array.from(th.parentElement!.children).indexOf(th);
      rows.sort((a, b) => {
        const av = a.children[colIndex].textContent?.trim() ?? '';
        const bv = b.children[colIndex].textContent?.trim() ?? '';
        const an = parseFloat(av);
        const bn = parseFloat(bv);
        const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv);
        return asc ? cmp : -cmp;
      });
      rows.forEach((r) => tbody.appendChild(r));

      table.querySelectorAll('th').forEach((h) => h.classList.remove('text-term-green'));
      th.classList.add('text-term-green');
    });
  });
}
