import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SelectGradeScreen extends StatefulWidget {
  @override
  _SelectGradeScreenState createState() => _SelectGradeScreenState();
}

class _SelectGradeScreenState extends State<SelectGradeScreen> {
  int? _selectedGrade;
  final List<int> grades = List.generate(12, (index) => index + 1); // Lớp 1-12

  Future<void> _saveGradeAndContinue() async {
    if (_selectedGrade == null) return;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('selectedGrade', _selectedGrade!);

    Navigator.pushReplacementNamed(context, '/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text('Chọn lớp của bạn', style: TextStyle(color: Colors.white)),
        centerTitle: true,
        backgroundColor: Colors.blue[700],
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Text(
              'Vui lòng chọn lớp bạn đang học',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
            ),
            SizedBox(height: 20),
            Expanded(
              child: ListView.builder(
                itemCount: grades.length,
                itemBuilder: (context, index) {
                  final grade = grades[index];
                  return Card(
                    elevation: 2,
                    margin: EdgeInsets.symmetric(vertical: 6),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    color: _selectedGrade == grade
                        ? Colors.blue[50]
                        : Colors.white,
                    child: ListTile(
                      leading: Icon(
                        Icons.school,
                        color: _selectedGrade == grade
                            ? Colors.blue[700]
                            : Colors.grey,
                      ),
                      title: Text(
                        'Lớp $grade',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: _selectedGrade == grade
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      ),
                      trailing: _selectedGrade == grade
                          ? Icon(Icons.check_circle, color: Colors.green)
                          : null,
                      onTap: () {
                        setState(() {
                          _selectedGrade = grade;
                          HapticFeedback.lightImpact();
                        });
                      },
                    ),
                  );
                },
              ),
            ),
            SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _selectedGrade != null
                      ? Colors.blue[700]
                      : Colors.grey,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                onPressed: _selectedGrade != null ? _saveGradeAndContinue : null,
                child: Text(
                  'TIẾP TỤC',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}