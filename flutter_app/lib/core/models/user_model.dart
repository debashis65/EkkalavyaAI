class UserModel {
  final String id;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? profileImageUrl;
  final String? role; // 'coach' or 'player'
  final String? sport;
  final DateTime? createdAt;

  UserModel({
    required this.id,
    required this.email,
    this.firstName,
    this.lastName,
    this.profileImageUrl,
    this.role,
    this.sport,
    this.createdAt,
  });

  String get fullName {
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    }
    return firstName ?? lastName ?? email.split('@').first;
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      profileImageUrl: json['profileImageUrl'],
      role: json['role'],
      sport: json['sport'],
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'profileImageUrl': profileImageUrl,
      'role': role,
      'sport': sport,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? profileImageUrl,
    String? role,
    String? sport,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      role: role ?? this.role,
      sport: sport ?? this.sport,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}