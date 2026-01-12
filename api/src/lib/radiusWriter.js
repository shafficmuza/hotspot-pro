const { sequelize } = require('../db');

async function applyPlanToUser({ username, passwordPlain, radiusGroup, validityMinutes, rateDownKbps, rateUpKbps }) {
  const t = await sequelize.transaction();
  try {
    await sequelize.query(
      `DELETE FROM radcheck WHERE username = ? AND attribute IN ('Cleartext-Password')`,
      { replacements: [username], transaction: t }
    );
    if (passwordPlain) {
      await sequelize.query(
        `INSERT INTO radcheck (username, attribute, op, value) VALUES (?, 'Cleartext-Password', ':=', ?)`,
        { replacements: [username, passwordPlain], transaction: t }
      );
    }

    await sequelize.query(`DELETE FROM radusergroup WHERE username = ?`, { replacements: [username], transaction: t });
    await sequelize.query(
      `INSERT INTO radusergroup (username, groupname, priority) VALUES (?, ?, 1)`,
      { replacements: [username, radiusGroup], transaction: t }
    );

    const rateStr = `${rateUpKbps}k/${rateDownKbps}k`;
    await sequelize.query(
      `DELETE FROM radgroupreply WHERE groupname = ? AND attribute IN ('Mikrotik-Rate-Limit','Session-Timeout')`,
      { replacements: [radiusGroup], transaction: t }
    );
    await sequelize.query(
      `INSERT INTO radgroupreply (groupname, attribute, op, value) VALUES (?, 'Mikrotik-Rate-Limit', ':=', ?)`,
      { replacements: [radiusGroup, rateStr], transaction: t }
    );
    await sequelize.query(
      `INSERT INTO radgroupreply (groupname, attribute, op, value) VALUES (?, 'Session-Timeout', ':=', ?)`,
      { replacements: [radiusGroup, String(validityMinutes * 60)], transaction: t }
    );

    await t.commit();
  } catch (e) {
    await t.rollback();
    throw e;
  }
}

module.exports = { applyPlanToUser };
