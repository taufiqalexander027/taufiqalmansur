const db = require('../config/database');

// --- Master Data (Rekening) ---

exports.syncMasterData = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { rekenings } = req.body; // Array of rekening objects

        if (!rekenings || !Array.isArray(rekenings)) {
            return res.status(400).json({ success: false, message: 'Invalid data format' });
        }

        // Upsert logic for each rekening
        for (const rek of rekenings) {
            await connection.query(
                `INSERT INTO finance_rekenings 
                (id, kode, uraian, seksi_id, program_id, program_nama, kegiatan_id, kegiatan_nama, sub_kegiatan_id, sub_kegiatan_nama, anggaran_pad, anggaran_dbhcht, sheet_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                kode = VALUES(kode),
                uraian = VALUES(uraian),
                program_id = VALUES(program_id),
                program_nama = VALUES(program_nama),
                kegiatan_id = VALUES(kegiatan_id),
                kegiatan_nama = VALUES(kegiatan_nama),
                sub_kegiatan_id = VALUES(sub_kegiatan_id),
                sub_kegiatan_nama = VALUES(sub_kegiatan_nama),
                anggaran_pad = VALUES(anggaran_pad),
                anggaran_dbhcht = VALUES(anggaran_dbhcht),
                sheet_name = VALUES(sheet_name)`,
                [
                    rek.id, rek.kode, rek.uraian, rek.seksiId,
                    rek.program?.id, rek.program?.nama,
                    rek.kegiatan?.id, rek.kegiatan?.nama,
                    rek.subKegiatan?.id, rek.subKegiatan?.nama,
                    rek.anggaranPAPBD?.PAD || 0,
                    rek.anggaranPAPBD?.DBHCHT || 0,
                    rek.sheetName
                ]
            );
        }

        await connection.commit();
        res.json({ success: true, message: `Synced ${rekenings.length} rekenings` });

    } catch (error) {
        await connection.rollback();
        console.error('Sync Master Data Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        connection.release();
    }
};

exports.getRekenings = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM finance_rekenings');

        // Transform back to frontend format
        const formatted = rows.map(row => ({
            id: row.id,
            kode: row.kode,
            uraian: row.uraian,
            seksiId: row.seksi_id,
            program: { id: row.program_id, nama: row.program_nama },
            kegiatan: { id: row.kegiatan_id, nama: row.kegiatan_nama },
            subKegiatan: { id: row.sub_kegiatan_id, nama: row.sub_kegiatan_nama },
            anggaranPAPBD: {
                PAD: parseFloat(row.anggaran_pad),
                DBHCHT: parseFloat(row.anggaran_dbhcht)
            },
            sheetName: row.sheet_name
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Get Rekenings Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- Transactions ---

exports.saveTransaction = async (req, res) => {
    try {
        const { id, rekeningId, tahun, bulan, seksiId, sumberDana, nilai, type } = req.body;

        // Check if exists (using composite key logic or ID if provided)
        // The frontend generates ID like: `${type}_${tahun}_${bulan}_${rekeningKode}_${sumberDana}`
        // But we use auto-increment ID in DB.
        // We should check uniqueness based on business keys: rekening_id, tahun, bulan, sumber_dana, type

        const [existing] = await db.query(
            'SELECT id FROM finance_transactions WHERE rekening_id = ? AND tahun = ? AND bulan = ? AND sumber_dana = ? AND type = ?',
            [rekeningId, tahun, bulan, sumberDana, type]
        );

        if (existing.length > 0) {
            // Update
            await db.query(
                'UPDATE finance_transactions SET nilai = ? WHERE id = ?',
                [nilai, existing[0].id]
            );
        } else {
            // Insert
            await db.query(
                'INSERT INTO finance_transactions (rekening_id, tahun, bulan, seksi_id, sumber_dana, nilai, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [rekeningId, tahun, bulan, seksiId, sumberDana, nilai, type]
            );
        }

        res.json({ success: true, message: 'Transaction saved' });

    } catch (error) {
        console.error('Save Transaction Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const { tahun } = req.query;
        let query = 'SELECT * FROM finance_transactions';
        let params = [];

        if (tahun) {
            query += ' WHERE tahun = ?';
            params.push(tahun);
        }

        const [rows] = await db.query(query, params);

        // Transform to frontend format
        const formatted = rows.map(row => ({
            id: `${row.type}_${row.tahun}_${row.bulan}_${row.rekening_id}_${row.sumber_dana}`, // Reconstruct ID for frontend consistency
            rekeningId: row.rekening_id,
            tahun: row.tahun,
            bulan: row.bulan,
            seksiId: row.seksi_id,
            sumberDana: row.sumber_dana,
            nilai: parseFloat(row.nilai),
            type: row.type
        }));

        res.json({ success: true, data: formatted });

    } catch (error) {
        console.error('Get Transactions Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
