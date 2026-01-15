import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { partnerAuthService } from "../../services/partnerAuth";
import { Upload, X, FileText, Camera } from "lucide-react";

const RegisterProperty: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: "",
        email: "",
        phone: "",
        password: "",
        propertyName: "",
        propertyAddress: "",
        description: "",
        city: "",
        state: "",
        postalCode: "",
        additionalContact: "",
    });

    const [files, setFiles] = useState<{ [key: string]: File | File[] | null }>({
        idDocument: null,
        businessLicense: null,
        propertyPhotos: [],
        otherDocuments: [],
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        if (e.target.files) {
            if (fieldName === "propertyPhotos" || fieldName === "otherDocuments") {
                const newFiles = Array.from(e.target.files);
                setFiles((prev) => ({
                    ...prev,
                    [fieldName]: [...(prev[fieldName] as File[]), ...newFiles],
                }));
            } else {
                setFiles((prev) => ({ ...prev, [fieldName]: e.target.files![0] }));
            }
        }
    };

    const removeFile = (fieldName: string, index?: number) => {
        if (index !== undefined) {
            setFiles((prev) => {
                const updatedFiles = [...(prev[fieldName] as File[])];
                updatedFiles.splice(index, 1);
                return { ...prev, [fieldName]: updatedFiles };
            });
        } else {
            setFiles((prev) => ({ ...prev, [fieldName]: null }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });

        if (files.idDocument) data.append("idDocument", files.idDocument as File);
        if (files.businessLicense) data.append("businessLicense", files.businessLicense as File);

        (files.propertyPhotos as File[]).forEach((file) => {
            data.append("propertyPhotos", file);
        });

        (files.otherDocuments as File[]).forEach((file) => {
            data.append("otherDocuments", file);
        });

        try {
            await partnerAuthService.registerProperty(data);
            toast.success("Property registered successfully!");
            // Reset form or redirect
        } catch (error: any) {
            console.error("Property registration error:", error);
            toast.error(error.response?.data?.message || "Failed to register property.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Register New Property</h2>
                <p className="text-gray-500">Provide details about your property and upload necessary documents.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Details Section */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Owner Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input type="text" id="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none" placeholder="John Doe" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input type="email" id="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                            <input type="tel" id="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none" placeholder="1234567890" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <input type="password" id="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none" placeholder="Min 8 characters" minLength={8} />
                        </div>
                    </div>
                </section>

                {/* Property Details Section */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Property Details</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
                            <input type="text" id="propertyName" required value={formData.propertyName} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none" placeholder="Sunset Villa" />
                        </div>
                        <div>
                            <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                            <input type="text" id="propertyAddress" required value={formData.propertyAddress} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none" placeholder="123 Street Name, City" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input type="text" id="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none" placeholder="City" />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input type="text" id="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none" placeholder="State" />
                            </div>
                            <div>
                                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                <input type="text" id="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none" placeholder="123456" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="description" rows={4} value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none" placeholder="Tell us about your property..."></textarea>
                        </div>
                    </div>
                </section>

                {/* Documents Section */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Documents & Photos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* ID Document */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ID Document (Aadhar/PAN/Passport) *</label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-400 transition-colors">
                                <input type="file" id="idDocument" required={!files.idDocument} onChange={(e) => handleFileChange(e, "idDocument")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".jpg,.jpeg,.png,.pdf" />
                                <div className="flex flex-col items-center">
                                    {files.idDocument ? (
                                        <div className="flex items-center space-x-2 text-green-600">
                                            <FileText size={24} />
                                            <span className="text-sm">{(files.idDocument as File).name}</span>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); removeFile("idDocument"); }} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="text-gray-400 mb-2" size={32} />
                                            <span className="text-sm text-gray-500">Click to upload ID Document</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Business License */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business License / Property Tax Receipt *</label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-400 transition-colors">
                                <input type="file" id="businessLicense" required={!files.businessLicense} onChange={(e) => handleFileChange(e, "businessLicense")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".jpg,.jpeg,.png,.pdf" />
                                <div className="flex flex-col items-center">
                                    {files.businessLicense ? (
                                        <div className="flex items-center space-x-2 text-green-600">
                                            <FileText size={24} />
                                            <span className="text-sm">{(files.businessLicense as File).name}</span>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); removeFile("businessLicense"); }} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="text-gray-400 mb-2" size={32} />
                                            <span className="text-sm text-gray-500">Click to upload Business License</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Photos (Up to 10 photos) *</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {(files.propertyPhotos as File[]).map((file, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                                    <img src={URL.createObjectURL(file)} alt={`photo-${idx}`} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeFile("propertyPhotos", idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"><X size={12} /></button>
                                </div>
                            ))}
                            <div className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-red-400 transition-colors cursor-pointer text-gray-400">
                                <input type="file" multiple onChange={(e) => handleFileChange(e, "propertyPhotos")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                <Camera size={24} />
                                <span className="text-xs mt-1">Add Photo</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pt-6">
                    <button type="submit" disabled={loading} className={`w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg transform transition active:scale-95 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
                        {loading ? "Registering Property..." : "Register Property"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterProperty;
