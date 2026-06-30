const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const SALT_ROUNDS = 10;

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Thuộc tính ảo (Virtual attribute) để tương thích ngược với Frontend (_id thay cho ObjectId)
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.id;
      },
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Full name is required' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Email is required' },
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    role: {
      type: DataTypes.ENUM('supermarket_owner', 'shift_manager', 'employee'),
      defaultValue: 'employee',
    },
    status: {
      type: DataTypes.ENUM('active', 'locked'),
      defaultValue: 'active',
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    phone: {
      type: DataTypes.STRING,
    },
    bankAccount: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    bankName: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    hourlyRate: {
      type: DataTypes.NUMERIC(10, 2),
      defaultValue: null,
      comment: 'Mức lương/giờ riêng của nhân viên (nếu null, dùng SalaryConfig theo role)',
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    refreshToken: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    deletedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    // Ẩn mật khẩu và refreshToken mặc định
    defaultScope: {
      attributes: { exclude: ['password', 'refreshToken'] },
    },
    // Scope dành cho Auth service
    scopes: {
      withPassword: {
        attributes: { include: ['password', 'refreshToken'] },
      },
    },
    hooks: {
      // Hook mã hóa mật khẩu trước khi tạo (thay thế pre-save Mongoose)
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        }
      },
      // Hook mã hóa mật khẩu trước khi cập nhật (thay thế pre-save Mongoose)
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        }
      },
    },
  }
);

// Ghi đè toJSON để đảm bảo virtual _id luôn có mặt trong payload response
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

// Instance method: Kiểm tra mật khẩu
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
