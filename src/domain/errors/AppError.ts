export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 401: غير مصرح (بيانات دخول خاطئة)
export class UnauthorizedError extends AppError {
  constructor(message: string = "كلمة المرور أو البريد الإلكتروني خطأ") {
    super(message, 401);
  }
}

// 403: محظور (ليس لديك صلاحية)
export class ForbiddenError extends AppError {
  constructor(message: string = "صلاحيات غير كافية لإجراء هذه العملية") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "العنصر المطلوب غير موجود") {
    super(message, 404);
  }
}

// 409: تعارض (موجود مسبقاً)
export class ConflictError extends AppError {
  constructor(message: string = "البيانات المدخلة متضاربة أو مسجلة مسبقاً") {
    super(message, 409);
  }
}
