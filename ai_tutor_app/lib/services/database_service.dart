class DatabaseService {
  static Future<List<Map<String, dynamic>>> getData() async {
    // fake/mock data hoặc gọi từ MongoDB/local database
    return [
      {'name': 'Nguyễn Văn A', 'email': 'a@gmail.com'},
      {'name': 'Trần Thị B', 'email': 'b@gmail.com'},
    ];
  }
}
