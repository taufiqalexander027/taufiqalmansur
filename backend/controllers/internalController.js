const db = require('../config/database');

// ===== ASN REPORTS =====

exports.createDailyReport = async (req, res) => {
    try {
        const { report_date, activity_description, work_hours, location, notes } = req.body;

        await db.query(
            `INSERT INTO asn_daily_reports (user_id, report_date, activity_description, work_hours, location, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, report_date, activity_description, work_hours || null, location || null, notes || null]
        );

        res.status(201).json({
            success: true,
            message: 'Laporan harian berhasil dibuat'
        });
    } catch (error) {
        console.error('CreateDailyReport error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat laporan'
        });
    }
};

exports.getMyDailyReports = async (req, res) => {
    try {
        const { month } = req.query;

        let query = 'SELECT * FROM asn_daily_reports WHERE user_id = ?';
        let params = [req.user.id];

        if (month) {
            query += ' AND DATE_FORMAT(report_date, "%Y-%m") = ?';
            params.push(month);
        }

        query += ' ORDER BY report_date DESC';

        const [reports] = await db.query(query, params);

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('GetMyDailyReports error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil laporan'
        });
    }
};

exports.createBerakhlakAssessment = async (req, res) => {
    try {
        const { assessment_period, berorientasi_pelayanan, akuntabel, kompeten, harmonis, loyal, adaptif, kolaboratif, notes } = req.body;

        const total_score = berorientasi_pelayanan + akuntabel + kompeten + harmonis + loyal + adaptif + kolaboratif;

        await db.query(
            `INSERT INTO asn_berakhlak_assessments 
       (user_id, assessment_period, berorientasi_pelayanan, akuntabel, kompeten, harmonis, loyal, adaptif, kolaboratif, total_score, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, assessment_period, berorientasi_pelayanan, akuntabel, kompeten, harmonis, loyal, adaptif, kolaboratif, total_score, notes]
        );

        res.status(201).json({
            success: true,
            message: 'Assessment berhasil disimpan'
        });
    } catch (error) {
        console.error('CreateBerakhlakAssessment error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menyimpan assessment'
        });
    }
};

// ===== FINANCIAL REPORTS =====

exports.getFinancialSummary = async (req, res) => {
    try {
        const { fiscal_year, program_code } = req.query;

        let query = 'SELECT * FROM v_financial_summary WHERE 1=1';
        let params = [];

        if (fiscal_year) {
            query += ' AND fiscal_year = ?';
            params.push(fiscal_year);
        }

        if (program_code) {
            query += ' AND program_code = ?';
            params.push(program_code);
        }

        const [summary] = await db.query(query, params);

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('GetFinancialSummary error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil ringkasan keuangan'
        });
    }
};

exports.createBudget = async (req, res) => {
    try {
        const { account_id, fiscal_year, budget_amount, source_of_funds } = req.body;

        await db.query(
            `INSERT INTO financial_budgets (account_id, fiscal_year, budget_amount, source_of_funds)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE budget_amount = ?`,
            [account_id, fiscal_year, budget_amount, source_of_funds || null, budget_amount]
        );

        res.status(201).json({
            success: true,
            message: 'Anggaran berhasil disimpan'
        });
    } catch (error) {
        console.error('CreateBudget error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menyimpan anggaran'
        });
    }
};

exports.createRealization = async (req, res) => {
    try {
        const { budget_id, month, realization_amount, notes } = req.body;

        await db.query(
            `INSERT INTO financial_realizations (budget_id, month, realization_amount, notes)
       VALUES (?, ?, ?, ?)`,
            [budget_id, month, realization_amount, notes || null]
        );

        res.status(201).json({
            success: true,
            message: 'Realisasi berhasil disimpan'
        });
    } catch (error) {
        console.error('CreateRealization error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menyimpan realisasi'
        });
    }
};

exports.getPrograms = async (req, res) => {
    try {
        const [programs] = await db.query('SELECT * FROM financial_programs ORDER BY code');
        res.json({
            success: true,
            data: programs
        });
    } catch (error) {
        console.error('GetPrograms error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data program'
        });
    }
};
