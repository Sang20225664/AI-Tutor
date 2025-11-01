import 'package:flutter/material.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';

class SafeListTile extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? contentPadding;

  const SafeListTile({
    super.key,
    this.leading,
    this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
    this.contentPadding,
  });

  @override
  Widget build(BuildContext context) {
    final isDesktop = Responsive.isDesktop(context);
    final horizontal = isDesktop ? 24.0 : 16.0;
    final vertical = isDesktop ? 16.0 : 8.0;

    return ListTile(
      leading:
          leading != null
              ? SizedBox(
                width: isDesktop ? 56 : 40,
                height: isDesktop ? 56 : 40,
                child: Center(child: leading),
              )
              : null,
      title: _wrapWithResponsiveText(context, title),
      subtitle: _wrapWithResponsiveText(
        context,
        subtitle,
        scale: isDesktop ? 1.1 : 1.0,
        color: Theme.of(context).textTheme.bodySmall?.color,
      ),
      trailing: trailing,
      onTap: onTap,
      contentPadding:
          contentPadding ??
          EdgeInsets.symmetric(horizontal: horizontal, vertical: vertical),
      dense: !isDesktop,
    );
  }

  Widget? _wrapWithResponsiveText(
    BuildContext context,
    Widget? child, {
    double scale = 1.0,
    Color? color,
  }) {
    if (child == null) return null;
    if (child is Text) {
      final style = child.style ?? Theme.of(context).textTheme.bodyMedium;
      return Text(
        child.data ?? '',
        maxLines: child.maxLines,
        overflow: child.overflow,
        style: style?.copyWith(
          fontSize: (style.fontSize ?? 16) * scale,
          color: color ?? style.color,
        ),
      );
    }
    return child;
  }
}
