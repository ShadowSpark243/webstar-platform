const p = require('./utils/db');
p.investment.findMany({
      where: { userId: 1 },
      include: { project: { select: { title: true } } }
}).then(r => {
      console.log('Count:', r.length);
      r.forEach(inv => console.log(`  #${inv.id} - ${inv.project.title} - amt:${inv.amount} - status:${inv.status}`));
      return p.$disconnect();
});
