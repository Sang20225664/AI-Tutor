import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:markdown/markdown.dart' as markdown;
import 'package:markdown_widget/markdown_widget.dart';

const _latexTag = 'latex';

final MarkdownGenerator aiTutorMarkdownGenerator = MarkdownGenerator(
  generators: [latexGenerator],
  inlineSyntaxList: [LatexSyntax()],
);

final SpanNodeGeneratorWithTag latexGenerator = SpanNodeGeneratorWithTag(
  tag: _latexTag,
  generator: (element, config, visitor) =>
      LatexNode(element.attributes, element.textContent, config),
);

class LatexSyntax extends markdown.InlineSyntax {
  LatexSyntax() : super(r'(\$\$[\s\S]+?\$\$)|(\$[^$\n]+?\$)');

  @override
  bool onMatch(markdown.InlineParser parser, Match match) {
    final matchValue = match.input.substring(match.start, match.end);
    var content = '';
    var isInline = true;

    if (matchValue.startsWith(r'$$') &&
        matchValue.endsWith(r'$$') &&
        matchValue.length > 4) {
      content = matchValue.substring(2, matchValue.length - 2).trim();
      isInline = false;
    } else if (matchValue.startsWith(r'$') &&
        matchValue.endsWith(r'$') &&
        matchValue.length > 2) {
      content = matchValue.substring(1, matchValue.length - 1).trim();
    }

    final element = markdown.Element.text(_latexTag, matchValue);
    element.attributes['content'] = content;
    element.attributes['isInline'] = '$isInline';
    parser.addNode(element);
    return true;
  }
}

class LatexNode extends SpanNode {
  final Map<String, String> attributes;
  final String textContent;
  final MarkdownConfig config;

  LatexNode(this.attributes, this.textContent, this.config);

  @override
  InlineSpan build() {
    final content = attributes['content'] ?? '';
    final isInline = attributes['isInline'] == 'true';
    final style = parentStyle ?? config.p.textStyle;

    if (content.isEmpty) {
      return TextSpan(text: _stripLatexDelimiters(textContent), style: style);
    }

    final latex = Math.tex(
      content,
      mathStyle: MathStyle.text,
      textStyle: style,
      onErrorFallback: (_) => Text(
        _stripLatexDelimiters(textContent),
        style: style,
      ),
    );

    return WidgetSpan(
      alignment: PlaceholderAlignment.middle,
      child: isInline
          ? latex
          : Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: latex,
            ),
    );
  }

  String _stripLatexDelimiters(String value) {
    if (value.startsWith(r'$$') && value.endsWith(r'$$')) {
      return value.substring(2, value.length - 2).trim();
    }
    if (value.startsWith(r'$') && value.endsWith(r'$')) {
      return value.substring(1, value.length - 1).trim();
    }
    return value;
  }
}
