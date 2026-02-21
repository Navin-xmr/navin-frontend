import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowLeft, Loader2 } from 'lucide-react';
import './CreateShipment.css';

interface FormData {
    origin: string;
    destination: string;
    itemDescription: string;
    weight: string;
    recipientName: string;
    recipientContact: string;
    expectedDeliveryDate: string;
}

interface FormErrors {
    [key: string]: string;
}

const CreateShipment: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        origin: '',
        destination: '',
        itemDescription: '',
        weight: '',
        recipientName: '',
        recipientContact: '',
        expectedDeliveryDate: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [shipmentId, setShipmentId] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: FormData) => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev: FormErrors) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.origin.trim()) newErrors.origin = 'Origin address is required';
        if (!formData.destination.trim()) newErrors.destination = 'Destination address is required';
        if (!formData.itemDescription.trim()) newErrors.itemDescription = 'Item description is required';
        if (!formData.weight || Number(formData.weight) <= 0) newErrors.weight = 'Valid weight is required';
        if (!formData.recipientName.trim()) newErrors.recipientName = 'Recipient name is required';
        if (!formData.recipientContact.trim()) newErrors.recipientContact = 'Recipient contact is required';
        if (!formData.expectedDeliveryDate) newErrors.expectedDeliveryDate = 'Expected delivery date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        // Simulate API request
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setShipmentId('#SHP-' + Math.floor(10000 + Math.random() * 90000));
        }, 1500);
    };

    if (success) {
        return (
            <div className="create-shipment-container success-view">
                <div className="success-content">
                    <CheckCircle2 size={64} className="text-green-500 mb-4 mx-auto" color="#22c55e" />
                    <h2 className="success-title">Shipment Created Successfully!</h2>
                    <p className="success-message">Your shipment has been registered on the blockchain.</p>
                    <div className="shipment-id-box">
                        <span className="shipment-id-label">Shipment ID:</span>
                        <span className="shipment-id-value">{shipmentId}</span>
                    </div>
                    <div className="success-actions">
                        <button className="primary-btn" onClick={() => navigate('/dashboard/shipments')}>
                            View Shipment
                        </button>
                        <button className="secondary-btn" onClick={() => {
                            setSuccess(false);
                            setFormData({
                                origin: '',
                                destination: '',
                                itemDescription: '',
                                weight: '',
                                recipientName: '',
                                recipientContact: '',
                                expectedDeliveryDate: '',
                            });
                        }}>
                            Create Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="create-shipment-container">
          <div className="header-actions">
              <button className="back-btn" onClick={() => navigate(-1)}>
                  <ArrowLeft size={20} />
                  <span>Back</span>
              </button>
          </div>

          <div className="form-wrapper">
              <div className="form-header">
                  <Package className="form-icon" size={28} />
                  <h2>Create New Shipment</h2>
                  <p>Enter the shipment details to register it on the blockchain.</p>
              </div>

              <form onSubmit={handleSubmit} className="shipment-form">
                  <div className="form-group">
                      <label htmlFor="origin">Origin Address</label>
                      <input
                          type="text"
                          id="origin"
                          name="origin"
                          value={formData.origin}
                          onChange={handleInputChange}
                          className={errors.origin ? 'input-error' : ''}
                          placeholder="e.g., Warehouse A, New York"
                      />
                      {errors.origin && <span className="error-text">{errors.origin}</span>}
                  </div>

                  <div className="form-group">
                      <label htmlFor="destination">Destination Address</label>
                      <input
                          type="text"
                          id="destination"
                          name="destination"
                          value={formData.destination}
                          onChange={handleInputChange}
                          className={errors.destination ? 'input-error' : ''}
                          placeholder="e.g., Store B, Los Angeles"
                      />
                      {errors.destination && <span className="error-text">{errors.destination}</span>}
                  </div>

                  <div className="form-group">
                      <label htmlFor="itemDescription">Item Description</label>
                      <textarea
                          id="itemDescription"
                          name="itemDescription"
                          value={formData.itemDescription}
                          onChange={handleInputChange}
                          className={errors.itemDescription ? 'input-error' : ''}
                          placeholder="Describe the items being shipped..."
                          rows={3}
                      />
                      {errors.itemDescription && <span className="error-text">{errors.itemDescription}</span>}
                  </div>

                  <div className="form-row">
                      <div className="form-group half-width">
                          <label htmlFor="weight">Weight (kg)</label>
                          <input
                              type="number"
                              id="weight"
                              name="weight"
                              value={formData.weight}
                              onChange={handleInputChange}
                              className={errors.weight ? 'input-error' : ''}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                          />
                          {errors.weight && <span className="error-text">{errors.weight}</span>}
                      </div>

                      <div className="form-group half-width">
                          <label htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
                          <input
                              type="date"
                              id="expectedDeliveryDate"
                              name="expectedDeliveryDate"
                              value={formData.expectedDeliveryDate}
                              onChange={handleInputChange}
                              className={errors.expectedDeliveryDate ? 'input-error' : ''}
                          />
                          {errors.expectedDeliveryDate && <span className="error-text">{errors.expectedDeliveryDate}</span>}
                      </div>
                  </div>

                  <div className="form-row">
                      <div className="form-group half-width">
                          <label htmlFor="recipientName">Recipient Name</label>
                          <input
                              type="text"
                              id="recipientName"
                              name="recipientName"
                              value={formData.recipientName}
                              onChange={handleInputChange}
                              className={errors.recipientName ? 'input-error' : ''}
                              placeholder="John Doe"
                          />
                          {errors.recipientName && <span className="error-text">{errors.recipientName}</span>}
                      </div>

                      <div className="form-group half-width">
                          <label htmlFor="recipientContact">Recipient Contact</label>
                          <input
                              type="text"
                              id="recipientContact"
                              name="recipientContact"
                              value={formData.recipientContact}
                              onChange={handleInputChange}
                              className={errors.recipientContact ? 'input-error' : ''}
                              placeholder="Phone or Email"
                          />
                          {errors.recipientContact && <span className="error-text">{errors.recipientContact}</span>}
                      </div>
                  </div>

                  <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => navigate(-1)} disabled={loading}>
                          Cancel
                      </button>
                      <button type="submit" className="submit-btn" disabled={loading}>
                          {loading ? (
                              <>
                                  <Loader2 className="spinner" size={20} />
                                  <span>Processing...</span>
                              </>
                          ) : (
                              'Create Shipment'
                          )}
                      </button>
                  </div>
              </form>
          </div>
    </div>
  );
};

export default CreateShipment;
