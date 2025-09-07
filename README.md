# Offline UPI

An Android application that enables users to perform UPI (Unified Payments Interface) transactions without requiring an active internet connection. Ideal for areas with limited or no network coverage, this app leverages USSD-based UPI services to facilitate seamless offline payments.

[![Latest release](https://img.shields.io/badge/Releases-v0.9-blue)](https://github.com/sahil-ingle/Offline-UPI/releases)


---

## Features

* **Offline UPI Transactions**: Initiate and complete UPI payments without internet connectivity.
* **USSD Integration**: Utilizes the UPI 123Pay service (\*99#) for transaction processing.
* **User-Friendly Interface**: Simple and intuitive design for easy navigation.
* **Secure Transactions**: Ensures safe and encrypted payment processes.

---

## Prerequisites

* **Android Device**: Requires a device running Android 5.0 (Lollipop) or higher.
* **SIM Card**: Must be a GSM-supported SIM card for USSD functionality.
* **Bank Compatibility**: Ensure your bank supports UPI 123Pay services.

---

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/sahil-ingle/Offline-UPI.git
   cd Offline-UPI
   ```

2. **Open in Android Studio**:

   Launch Android Studio and open the cloned project directory.

3. **Build the APK**:

   In Android Studio, click on `Build > Build APK(s)` to generate the APK file.

4. **Install the APK**:

   Transfer the APK to your Android device and install it.

---

## Usage

1. **Launch the App**:

   Open the app on your Android device.

2. **Initiate a Transaction**:

   Enter the recipient's UPI ID, amount, and any additional details.

3. **Confirm Payment**:

   The app will process the transaction using the UPI 123Pay service via USSD.

4. **Receive Confirmation**:

   Upon successful payment, a confirmation message will be displayed.

---

## Limitations

* **SIM Compatibility**: Only works with SIM cards that support GSM and USSD services.
* **Bank Support**: Availability of UPI 123Pay services may vary by bank.
* **Network Availability**: While the app operates offline, initial setup and certain features may require an internet connection.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

* [NPCI](https://www.npci.org.in/) for the UPI 123Pay service.
* [Android Developers](https://developer.android.com/) for providing the tools and documentation to build Android applications.
