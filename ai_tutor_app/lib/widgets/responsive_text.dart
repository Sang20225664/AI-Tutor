import 'package:flutter/material.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';

class ResponsiveText extends StatelessWidget {
  final String text;
  final double mobileSize;
  final double tabletSize;
  final double desktopSize;
  final TextStyle? style;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;

  const ResponsiveText(
    this.text, {
    super.key,
    this.mobileSize = 16,
    this.tabletSize = 18,
    this.desktopSize = 20,
    this.style,
    this.textAlign,
    this.maxLines,
    this.overflow,
  });

  @override
  Widget build(BuildContext context) {
    final baseStyle = style ?? Theme.of(context).textTheme.bodyMedium;
    double fontSize = mobileSize;

    if (Responsive.isDesktop(context)) {
      fontSize = desktopSize;
    } else if (Responsive.isTablet(context)) {
      fontSize = tabletSize;
    }

    return Text(
      text,
      style:
          baseStyle?.copyWith(fontSize: fontSize) ??
          TextStyle(fontSize: fontSize),
      textAlign: textAlign,
      maxLines: maxLines,
      overflow: overflow,
    );
  }
}
