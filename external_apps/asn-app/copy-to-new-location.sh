#!/bin/bash

echo "🚀 Memindahkan aplikasi E-Laporan ASN Jatim..."
echo ""

# Membuat folder tujuan jika belum ada
mkdir -p /Users/taura/Documents/ANTIGRAVITY

# Copy semua file
cp -r /Users/taura/Documents/oit/antigravity/e-laporan-asn-jatim /Users/taura/Documents/ANTIGRAVITY/APLIKASI_SKP

# Cek apakah berhasil
if [ -d "/Users/taura/Documents/ANTIGRAVITY/APLIKASI_SKP" ]; then
    echo "✅ BERHASIL! Aplikasi sudah dicopy ke:"
    echo "   /Users/taura/Documents/ANTIGRAVITY/APLIKASI_SKP"
    echo ""
    echo "📁 Isi folder:"
    ls -la /Users/taura/Documents/ANTIGRAVITY/APLIKASI_SKP | head -20
else
    echo "❌ GAGAL! Ada masalah saat copy."
fi
