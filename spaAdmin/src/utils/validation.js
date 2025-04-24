export const validateService = (service, index) => {
  const requiredFields = ['title', 'description', 'price', 'image', 'category'];
  const missingFields = requiredFields.filter(field => !service[field]);

  if (missingFields.length > 0) {
    throw new Error(`Service ${index + 1} is missing: ${missingFields.join(', ')}`);
  }

  if (service.duration.some(d => !d)) {
    throw new Error(`Service ${index + 1} has invalid duration`);
  }

  if (service.details.some(d => !d)) {
    throw new Error(`Service ${index + 1} has invalid details`);
  }

  if (isNaN(Number(service.price)) || Number(service.price) <= 0) {
    throw new Error(`Service ${index + 1} needs valid price`);
  }
};
