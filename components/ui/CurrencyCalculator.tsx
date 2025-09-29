import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/components/design';
import { currencyService, CURRENCIES, CurrencyInfo } from '@/lib/currency';

interface CurrencyCalculatorProps {
  visible: boolean;
  onClose: () => void;
  fromCurrency: string;
  toCurrency: string;
  initialAmount?: string;
  onAmountChange?: (amount: string, currency: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BUTTON_MARGIN = 12;
const HORIZONTAL_PADDING = 32;
const buttonSize = (screenWidth - HORIZONTAL_PADDING - (BUTTON_MARGIN * 3)) / 4; // 4 buttons per row with proper margins

export default function CurrencyCalculator({
  visible,
  onClose,
  fromCurrency,
  toCurrency,
  initialAmount = '',
  onAmountChange,
}: CurrencyCalculatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [display, setDisplay] = useState(initialAmount);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [lastOperation, setLastOperation] = useState<string>('');
  const [operator, setOperator] = useState<string>('');
  const [previousValue, setPreviousValue] = useState<number>(0);
  const [waitingForNewNumber, setWaitingForNewNumber] = useState(false);
  const [currentFromCurrency, setCurrentFromCurrency] = useState(fromCurrency);
  const [currentToCurrency, setCurrentToCurrency] = useState(toCurrency);
  const [showFromCurrencySelector, setShowFromCurrencySelector] = useState(false);
  const [showToCurrencySelector, setShowToCurrencySelector] = useState(false);

  useEffect(() => {
    // Always try to convert, even for '0' or empty display
    convertCurrency();
  }, [display, currentFromCurrency, currentToCurrency]);

  useEffect(() => {
    setCurrentFromCurrency(fromCurrency);
    setCurrentToCurrency(toCurrency);
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (initialAmount !== display) {
      setDisplay(initialAmount);
    }
  }, [initialAmount]);

  const convertCurrency = async () => {
    const displayValue = display || '0';
    const amount = parseFloat(displayValue);

    // Always convert, even for 0
    if (isNaN(amount)) {
      setConvertedAmount(0);
      return;
    }

    setIsConverting(true);
    try {
      const result = await currencyService.convertCurrency(amount, currentFromCurrency, currentToCurrency);
      setConvertedAmount(result);
    } catch (error) {
      console.warn('Currency conversion failed:', error);
      // Fallback: set converted amount to the same value
      setConvertedAmount(amount);
    } finally {
      setIsConverting(false);
    }
  };

  const handleNumberPress = async (num: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (waitingForNewNumber) {
      setDisplay(num);
      setWaitingForNewNumber(false);
    } else {
      if (display === '0' || display === '') {
        setDisplay(num);
      } else if (display.length < 10) {
        setDisplay(display + num);
      }
    }
  };

  const handleDecimalPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (waitingForNewNumber) {
      setDisplay('0.');
      setWaitingForNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDisplay('0');
    setOperator('');
    setPreviousValue(0);
    setLastOperation('');
    setWaitingForNewNumber(false);
    setConvertedAmount(null);
  };

  const handleBackspace = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleOperatorPress = async (op: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const currentValue = parseFloat(display);

    if (operator && !waitingForNewNumber) {
      const result = calculateResult();
      setDisplay(result.toString());
      setPreviousValue(result);
    } else {
      setPreviousValue(currentValue);
    }

    setOperator(op);
    setWaitingForNewNumber(true);
  };

  const handleEquals = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (operator && !waitingForNewNumber) {
      const result = calculateResult();
      setDisplay(result.toString());
      setLastOperation(`${previousValue} ${operator} ${parseFloat(display)} =`);
      setOperator('');
      setPreviousValue(0);
      setWaitingForNewNumber(true);
      // Conversion will be triggered by useEffect when display changes
    }
  };

  const calculateResult = (): number => {
    const current = parseFloat(display);

    switch (operator) {
      case '+':
        return previousValue + current;
      case '-':
        return previousValue - current;
      case '×':
        return previousValue * current;
      case '÷':
        return previousValue / current;
      default:
        return current;
    }
  };


  const handleUseAmount = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (onAmountChange) {
      onAmountChange(display, currentFromCurrency);
    }

    onClose(); // Close modal
  };

  const handleSwapCurrencies = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const temp = currentFromCurrency;
    setCurrentFromCurrency(currentToCurrency);
    setCurrentToCurrency(temp);
  };

  const getCurrencyInfo = (code: string): CurrencyInfo | undefined => {
    return CURRENCIES.find(c => c.code === code);
  };

  const renderButton = (
    title: string,
    onPress: () => void,
    style: 'number' | 'operator' | 'clear' | 'equals' = 'number'
  ) => {
    let buttonStyle = styles.numberButton;
    let textStyle = [styles.buttonText, { color: isDark ? '#FFFFFF' : '#000000' }];

    switch (style) {
      case 'operator':
        buttonStyle = styles.operatorButton;
        textStyle = [styles.buttonText, { color: '#FFFFFF' }];
        break;
      case 'clear':
        buttonStyle = styles.clearButton;
        textStyle = [styles.buttonText, { color: '#000000' }];
        break;
      case 'equals':
        buttonStyle = styles.equalsButton;
        textStyle = [styles.buttonText, { color: '#FFFFFF' }];
        break;
    }

    return (
      <TouchableOpacity
        style={[buttonStyle, { backgroundColor: isDark && style === 'number' ? '#333333' : buttonStyle.backgroundColor }]}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <Text style={textStyle}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const fromCurrencyInfo = getCurrencyInfo(currentFromCurrency);
  const toCurrencyInfo = getCurrencyInfo(currentToCurrency);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        {/* Modal Header */}
        <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#333333' : '#E5E5E5' }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Währungsrechner
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.modalContent}>
          {/* Display */}
          <View style={[styles.display, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
            <View style={styles.displayContent}>
              {lastOperation ? (
                <Text style={[styles.lastOperation, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {lastOperation}
                </Text>
              ) : null}

              {/* Current Operation Display */}
              {operator && !waitingForNewNumber && (
                <Text style={[styles.currentOperation, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {previousValue} {operator}
                </Text>
              )}

              <View style={styles.currentAmount}>
                <TouchableOpacity
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowFromCurrencySelector(true);
                  }}
                  style={styles.currencyLabelButton}
                >
                  <Text style={[styles.currencyLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    {fromCurrencyInfo?.flag} {currentFromCurrency}
                  </Text>
                  <Icon name="chevron-down" size={14} color={isDark ? '#8E8E93' : '#6D6D70'} />
                </TouchableOpacity>
                <Text style={[styles.amountText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  {display || '0'}
                </Text>
              </View>

              {/* Swap Button */}
              <View style={styles.swapContainer}>
                <TouchableOpacity
                  onPress={handleSwapCurrencies}
                  style={[styles.swapButton, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
                >
                  <Icon name="swap-horizontal" size={16} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                </TouchableOpacity>
              </View>

              <View style={styles.convertedAmount}>
                <View style={styles.convertedAmountContent}>
                  <TouchableOpacity
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowToCurrencySelector(true);
                    }}
                    style={styles.currencyLabelButton}
                  >
                    <Text style={[styles.currencyLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {toCurrencyInfo?.flag} {currentToCurrency}
                    </Text>
                    <Icon name="chevron-down" size={14} color={isDark ? '#8E8E93' : '#6D6D70'} />
                  </TouchableOpacity>
                  <Text style={[styles.convertedAmountText, { color: isDark ? '#30D158' : '#34C759' }]}>
                    {isConverting ? 'Rechnet...' :
                     convertedAmount !== null ? convertedAmount.toFixed(2) : '0.00'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.useButton]}
              onPress={handleUseAmount}
            >
              <Icon name="check" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Verwenden</Text>
            </TouchableOpacity>
          </View>

          {/* Calculator Buttons */}
          <View style={styles.buttonGrid}>
            <View style={styles.buttonRow}>
              {renderButton('C', handleClear, 'clear')}
              {renderButton('⌫', handleBackspace, 'clear')}
              {renderButton('÷', () => handleOperatorPress('÷'), 'operator')}
              {renderButton('×', () => handleOperatorPress('×'), 'operator')}
            </View>

            <View style={styles.buttonRow}>
              {renderButton('7', () => handleNumberPress('7'))}
              {renderButton('8', () => handleNumberPress('8'))}
              {renderButton('9', () => handleNumberPress('9'))}
              {renderButton('-', () => handleOperatorPress('-'), 'operator')}
            </View>

            <View style={styles.buttonRow}>
              {renderButton('4', () => handleNumberPress('4'))}
              {renderButton('5', () => handleNumberPress('5'))}
              {renderButton('6', () => handleNumberPress('6'))}
              {renderButton('+', () => handleOperatorPress('+'), 'operator')}
            </View>

            <View style={styles.buttonRowWithEquals}>
              <View style={styles.leftButtons}>
                <View style={styles.buttonRow}>
                  {renderButton('1', () => handleNumberPress('1'))}
                  {renderButton('2', () => handleNumberPress('2'))}
                  {renderButton('3', () => handleNumberPress('3'))}
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.numberButton,
                      {
                        width: buttonSize * 2 + BUTTON_MARGIN, // Span two columns with margin
                        backgroundColor: isDark ? '#333333' : '#E5E5EA'
                      }
                    ]}
                    onPress={() => handleNumberPress('0')}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.buttonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>0</Text>
                  </TouchableOpacity>
                  {renderButton('.', handleDecimalPress)}
                </View>
              </View>
              <View style={styles.equalsColumn}>
                {renderButton('=', handleEquals, 'equals')}
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Simple Currency Picker */}
      {(showFromCurrencySelector || showToCurrencySelector) && (
        <View style={styles.pickerOverlay}>
          <TouchableOpacity
            style={styles.pickerBackdrop}
            onPress={() => {
              setShowFromCurrencySelector(false);
              setShowToCurrencySelector(false);
            }}
          />
          <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                {showFromCurrencySelector ? 'Von Währung' : 'Zu Währung'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowFromCurrencySelector(false);
                  setShowToCurrencySelector(false);
                }}
                style={styles.pickerCloseButton}
              >
                <Icon name="close" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {CURRENCIES.slice(0, 20).map((currency) => ( // Show first 20 currencies
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.pickerItem,
                    {
                      backgroundColor:
                        (showFromCurrencySelector && currentFromCurrency === currency.code) ||
                        (showToCurrencySelector && currentToCurrency === currency.code)
                          ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
                          : 'transparent',
                    }
                  ]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (showFromCurrencySelector) {
                      setCurrentFromCurrency(currency.code);
                      setShowFromCurrencySelector(false);
                    } else {
                      setCurrentToCurrency(currency.code);
                      setShowToCurrencySelector(false);
                    }
                  }}
                >
                  <Text style={styles.pickerFlag}>{currency.flag}</Text>
                  <View style={styles.pickerCurrencyText}>
                    <Text style={[styles.pickerCurrencyCode, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {currency.code}
                    </Text>
                    <Text style={[styles.pickerCurrencyName, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {currency.name}
                    </Text>
                  </View>
                  {((showFromCurrencySelector && currentFromCurrency === currency.code) ||
                   (showToCurrencySelector && currentToCurrency === currency.code)) && (
                    <Icon name="check" size={16} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  headerSpacer: {
    width: 36, // Same width as close button to center title
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  display: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  displayContent: {
    gap: 8,
  },
  lastOperation: {
    fontSize: 14,
    fontFamily: 'System',
    textAlign: 'right',
  },
  currentOperation: {
    fontSize: 16,
    fontFamily: 'System',
    textAlign: 'right',
    marginBottom: 4,
  },
  currentAmount: {
    alignItems: 'flex-end',
  },
  currencyLabel: {
    fontSize: 14,
    fontFamily: 'System',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '300',
    fontFamily: 'System',
  },
  convertedAmount: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(60, 60, 67, 0.12)',
  },
  convertedAmountContent: {
    alignItems: 'flex-end',
  },
  convertedAmountText: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'System',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  useButton: {
    backgroundColor: '#007AFF',
    flex: 1,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  buttonGrid: {
    gap: BUTTON_MARGIN,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: BUTTON_MARGIN,
    marginBottom: BUTTON_MARGIN,
  },
  numberButton: {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  operatorButton: {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    backgroundColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equalsButton: {
    width: buttonSize,
    height: buttonSize * 2 + BUTTON_MARGIN, // Span two rows with margin
    borderRadius: buttonSize / 4, // Smaller radius for tall button
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '400',
    fontFamily: 'System',
  },
  buttonRowWithEquals: {
    flexDirection: 'row',
    gap: BUTTON_MARGIN,
    marginBottom: BUTTON_MARGIN,
  },
  leftButtons: {
    flex: 1,
  },
  equalsColumn: {
    width: buttonSize,
    justifyContent: 'center',
  },
  spacer: {
    width: buttonSize,
  },
  currencyLabelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  pickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.12)',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  pickerCloseButton: {
    padding: 8,
    marginRight: -8,
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  pickerCurrencyText: {
    flex: 1,
  },
  pickerCurrencyCode: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 2,
  },
  pickerCurrencyName: {
    fontSize: 14,
    fontFamily: 'System',
  },
});