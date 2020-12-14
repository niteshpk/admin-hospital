export const environment = {
  production: true,
  restrict: {
    product: [
      'delete',
      'update'
    ],
    category: [
      'delete',
      'update'
    ],
    user: [
      'delete',
      'update'
    ],
    order: [
      'delete'
    ]
  }
};
