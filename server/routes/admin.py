# server/routes/admin.py

@admin_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_admin_summary():
    try:
        users_count = User.query.count()
        loans_count = Loan.query.count()  # or 0 if not implemented
        contributions_count = Contribution.query.count()
        payments_count = 0  # Placeholder or actual value

        return jsonify({
            'users': users_count,
            'loans': loans_count,
            'contributions': contributions_count,
            'payments': payments_count,
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
