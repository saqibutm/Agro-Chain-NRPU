// Top-level crash catcher. Without this, a render error in any single screen
// takes down the entire app to a native red-box crash screen with no
// recovery path but force-quitting — this happened during development (a
// bad Camera import crashed the whole app instead of just the QR scanner).
// Must be a class component: componentDidCatch/getDerivedStateFromError
// have no hooks equivalent.
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // No crash-reporting SDK wired up — at minimum, don't lose the error silently.
    console.error("Unhandled error caught by ErrorBoundary:", error, info?.componentStack);
  }

  handleRetry = () => {
    // Remounts everything below this boundary (including AuthProvider and
    // NavigationContainer), which naturally resets to a safe screen instead
    // of re-rendering the exact state that crashed.
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>کچھ غلط ہو گیا</Text>
          <Text style={styles.message}>
            The app hit an unexpected error. Your data is safe — try again below.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", color: "green", marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 18, fontWeight: "600", color: "green", marginBottom: 16, textAlign: "center" },
  message: { fontSize: 15, color: "#555", textAlign: "center", marginBottom: 24, lineHeight: 22 },
  button: { backgroundColor: "green", paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});

export default ErrorBoundary;
